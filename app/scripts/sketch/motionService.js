// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

angular.module('geomeditApp')
  .service('motion', ['model', 'snap', function(model, snap) {
    'use strict';

    this.startPt = null;
    this.lastPt = null;
    this.pt = null;
    this.dragging = false;

    this.updateStartCoords = function(e) {
      this.startPt = this.lastPt = this.pt = this.getEventCoords(e);
    };

    this.updateCoords = function(e) {
      this.pt = this.getEventCoords(e);
    };

    this.clear = function() {
      this.clearDrafts();
      this.clearDraftCoords();
    };

    this.clearDraftCoords = function() {
      while (model.snaps.length > 0) {
        model.snaps.pop().clear();
      }
      this.startPt = this.lastPt = this.pt = null;
    };

    this.clearDrafts = function() {
      while (model.drafts.length > 0) {
        model.board.removeObject(model.drafts.pop());
      }
    };

    this.getDraftCoords = function(index) {
      index = JXG.def(index, -1);
      index = index < 0 ? model.snaps.length + index : index;
      return model.snaps[index];
    };

    this.setDraftCoords = function(index, snapMasks) {
      index = index < 0 ? model.snaps.length + index : index;
      model.snaps[index] = snap.snapCoords(this.pt, model.snaps[index], snapMasks);
    };

    this.updateDraftCoords = function() {
      var index = model.snaps.length - 1;
      model.snaps[index] = snap.snapCoords(this.pt, model.snaps[index]);
    };

    this.addDraftCoords = function(snapMasks) {
      var r = snap.snapCoords(this.pt, null, snapMasks);
      model.snaps.push(r);
      return r;
    };

    this.draftCoordsCount = function() {
      return model.snaps.length;
    };

    this.hasDraftCoords = function() {
      return model.snaps.length > 0;
    };

    this.lastDraftCoordsIsNew = function() {
      var dist = 0;
      if (model.snaps.length > 1) {
        dist = this.getDraftCoords(-1).coords.distance(JXG.COORDS_BY_SCREEN, this.getDraftCoords(-2).coords);
      }
      return dist > 5;
    };

    this.createDraftPoint = function(index) {
      var getCoords = function(el) {
            return el ? (el.point2 ? el.point2.coords : el.coords) : null;
          },
          get = function(order) {
            var i = Math.min(index, model.snaps.length - 1),
                item = i < 0 ? null : model.snaps[i];
            return item ? (getCoords(item.created) || item.coords).usrCoords[order] : 0;
          },
          xfn = function() {
            return get(1);
          },
          yfn = function() {
            return get(2);
          };
      var point = model.create('point', [xfn, yfn], { withLabel: false }),
          initial = JXG.deepCopy({}, point.visProp),
          snapSize = Math.max(model.board.options.precision.hasPoint, initial.size + 6);

      function update() {
        var i = Math.min(index, model.snaps.length - 1),
            snapped = i >= 0 && model.snaps[i].snapped,
            created = snapped ? model.snaps[i].created : null,
            opacity = created && model.snaps[i].glider ? 0.1 : snapped ? 0.4 : 1.0,
            color = created ? created.visProp.strokecolor : initial.strokecolor;

        point.setAttribute({
          size: snapped ? snapSize : initial.size,
          fillOpacity: opacity,
          strokeColor: color
        });
      }

      point.coords.on('update', update, point);
      update();

      model.drafts.push(point);
      return point;
    };

    this.createDraftPoints = function(indexes) {
      var self = this;
      indexes = JXG.isArray(indexes) ? indexes : Array.prototype.slice.call(arguments);
      return indexes.map(function(i) {
        return self.createDraftPoint(i);
      });
    };

    this.createPoint = function(index, allowSnapped, attr) {
      var it = JXG.isObject(index) ? index : model.snaps[index < 0 ? model.snaps.length + index : index];
      if (allowSnapped && JXG.isPoint(it.snapped) && !it.created) {
        return it.snapped;
      }
      return createPendingsPoint(it, attr);
    };

    function createPendingsPoint(it, attr) {
      var point = it.detach() || !it.snapped && model.create('point', it.coords.usrCoords.slice(1), attr);
      if (point && model.pendings) {
        model.pendings.push(point);
      }
      return point;
    }

    this.createGlider = function(el, coords) {
      var point = model.create('glider', (coords || this.pt).usrCoords.slice(1).concat(el));
      if (point && model.pendings) {
        model.pendings.push(point);
      }
      return point;
    };

    this.createPoints = function(attr) {
      var self = this,
          ret = model.snaps.map(function(item) {
            return self.createPoint(item, true, attr);
          });
      model.snaps.length = 0;
      return ret;
    };

    this.recordObjects = function() {
      return {
        oldList: model.board.objectsList.slice(0),
        getNewObjects: function() {
          var self = this;
          return model.board.objectsList.filter(function(el) {
            return self.oldList.indexOf(el) < 0;
          });
        },
        addTo: function(dest, src) {
          var ret;
          src = src || this.getNewObjects();
          if (src) {
            src.forEach(function(el) {
              if (dest.indexOf(el) < 0) {
                dest.push(el);
                ret = el;
              }
            });
          }
          return ret;
        }
      };
    };

    this.submit = function(creation) {
      var self = this,
          recorder = this.recordObjects();

      try {
        self.clearDrafts();
        model.pendings = [];
        creation();
        model.propObj = recorder.addTo(model.pendings);
      } catch (e) {
        while (model.pendings.length > 0) {
          model.board.removeObject(model.pendings.pop());
        }
        throw e;
      } finally {
        model.pendings = null;
        self.clearDraftCoords();
      }
    };

    this.isSegment = snap.isSegment;
    this.hitTest = function(masks) {
      return snap.hitTest(this.pt, masks);
    };

    this.getMouseCoords = function(e) {
      var absPos = JXG.getPosition(e),
          lt = model.board.getCoordsTopLeftCorner(),
          dx = absPos[0] - lt[0],
          dy = absPos[1] - lt[1];
      return new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], model.board);
    };

    this.getTouchCoords = function(e, index) {
      var absPos = JXG.getPosition(e, index),
          lt = model.board.getCoordsTopLeftCorner(),
          dx = absPos[0] - lt[0],
          dy = absPos[1] - lt[1];
      return new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], model.board);
    };

    this.getEventCoords = function(e) {
      return e[JXG.touchProperty] ? this.getTouchCoords(e, -1) : this.getMouseCoords(e);
    };

  }]);
