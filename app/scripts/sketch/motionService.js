// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .service('motion', ['board', 'snap', function(bd, snap) {
    this.startPt = null;
    this.lastPt = null;
    this.pt = null;
    this.dragging = false;
    this.pendings = null;

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
      while (bd.snaps.length > 0) {
        bd.snaps.pop().clear();
      }
      this.startPt = this.lastPt = this.pt = null;
    };

    this.clearDrafts = function() {
      while (bd.drafts.length > 0) {
        bd.board.removeObject(bd.drafts.pop());
      }
    };

    this.getDraftCoords = function(index) {
      index = index === undefined ? -1 : index;
      index = index < 0 ? bd.snaps.length + index : index;
      return bd.snaps[index].coords;
    };

    this.setDraftCoords = function(index, pt) {
      index = index === undefined ? -1 : index;
      index = index < 0 ? bd.snaps.length + index : index;
      bd.snaps[index] = snap.snapCoords(pt === undefined ? this.pt : pt, bd.snaps[index]);
    };

    this.addDraftCoords = function(pt) {
      return bd.snaps.push(snap.snapCoords(pt === undefined ? this.pt : pt));
    };

    this.draftCoordsCount = function() {
      return bd.snaps.length;
    };

    this.hasDraftCoords = function() {
      return bd.snaps.length > 0;
    };

    this.lastDraftCoordsIsNew = function() {
      var dist = this.getDraftCoords(-1).distance(JXG.COORDS_BY_SCREEN, this.getDraftCoords(-2));
      return dist > 5;
    };

    this.createDraftPoint = function(index) {
      var get = function(order) {
            var i = Math.min(index, bd.snaps.length - 1),
                item = i < 0 ? null : bd.snaps[i];
            return item ? (item.created ? item.created.coords : item.coords).usrCoords[order] : 0;
          },
          xfn = function() { return get(1); },
          yfn = function() { return get(2); };
      var point = bd.create('point', [xfn, yfn], { withLabel: false }),
          initial = JXG.deepCopy({}, point.visProp),
          snapSize = Math.max(bd.board.options.precision.hasPoint, initial.size + 4);

      function update() {
        var i = Math.min(index, bd.snaps.length - 1),
            snapped = i >= 0 && bd.snaps[i].snapped,
            created = snapped ? bd.snaps[i].created : null;
        point.visProp.size = snapped ? snapSize : initial.size;
        point.visProp.fillopacity = created && bd.snaps[i].glider ? 0.1 : snapped ? 0.3 : 1.0;
        point.visProp.strokecolor = created ? created.visProp.strokecolor : initial.strokecolor;
      }

      point.coords.on('update', update, point);
      update();

      bd.drafts.push(point);
      return point;
    };

    this.createDraftPoints = function(indexes) {
      var self = this;
      indexes = JXG.isArray(indexes) ? indexes : Array.prototype.slice.call(arguments);
      return indexes.map(function(i) { return self.createDraftPoint(i); });
    };

    this.createPoint = function(index, attr) {
      var point = (function() {
            var it = bd.snaps[index];
            return it.detach() || !it.snapped && bd.create('point', it.coords.usrCoords.slice(1), attr);
          }());

      if (point && this.pendings) {
        this.pendings.push(point);
      }
      return point;
    };

    this.createPoints = function(attr) {
      var self = this;
      var ret = bd.snaps.map(function(item) {
        if (item.snapped && !item.created) {
          return item.snapped;
        }
        var point = item.created || bd.create('point', item.coords.usrCoords.slice(1), attr);
        if (point && self.pendings) {
          self.pendings.push(point);
        }
        return point;
      });
      bd.snaps.length = 0;
      return ret;
    };

    this.submit = function(creation) {
      var self = this;
      try {
        self.clearDrafts();
        self.pendings = [];
        creation();
      } catch (e) {
        self.pendings.forEach(function(el) {
          bd.board.removeObject(el);
        });
        throw e;
      } finally {
        self.pendings = null;
        self.clearDraftCoords();
      }
    };

    this.getMouseCoords = function(e) {
      var absPos = JXG.getPosition(e),
          cPos = bd.board.getCoordsTopLeftCorner(),
          dx = absPos[0] - cPos[0],
          dy = absPos[1] - cPos[1];
      return new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], bd.board);
    };

    this.getTouchCoords = function(e, index) {
      var absPos = JXG.getPosition(e, index),
          cPos = bd.board.getCoordsTopLeftCorner(),
          dx = absPos[0] - cPos[0],
          dy = absPos[1] - cPos[1];
      return new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], bd.board);
    };

    this.getEventCoords = function(e) {
      return e[JXG.touchProperty] ? this.getTouchCoords(e, -1) : this.getMouseCoords(e);
    };

  }]);
