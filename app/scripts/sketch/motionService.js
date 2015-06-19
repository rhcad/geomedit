// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .service('motion', ['board', 'snap', function(bd, snap) {
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
      index = JXG.def(index, -1);
      index = index < 0 ? bd.snaps.length + index : index;
      return bd.snaps[index];
    };

    this.setDraftCoords = function(index, snapMasks) {
      index = index < 0 ? bd.snaps.length + index : index;
      bd.snaps[index] = snap.snapCoords(this.pt, bd.snaps[index], snapMasks);
    };

    this.updateDraftCoords = function() {
      var index = bd.snaps.length - 1;
      bd.snaps[index] = snap.snapCoords(this.pt, bd.snaps[index]);
    };

    this.addDraftCoords = function(snapMasks) {
      return bd.snaps.push(snap.snapCoords(this.pt, null, snapMasks));
    };

    this.draftCoordsCount = function() {
      return bd.snaps.length;
    };

    this.hasDraftCoords = function() {
      return bd.snaps.length > 0;
    };

    this.lastDraftCoordsIsNew = function() {
      var dist = 0;
      if (bd.snaps.length > 1) {
        dist = this.getDraftCoords(-1).coords.distance(JXG.COORDS_BY_SCREEN, this.getDraftCoords(-2).coords);
      }
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
        point.setAttribute({
          size:        snapped ? snapSize : initial.size,
          fillopacity: created && bd.snaps[i].glider ? 0.1 : snapped ? 0.3 : 1.0,
          strokecolor: created ? created.visProp.strokecolor : initial.strokecolor
        });
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

    this.createPoint = function(index, allowSnapped, attr) {
      var it = JXG.isObject(index) ? index : bd.snaps[index];
      if (allowSnapped && it.snapped && !it.created) {
        return it.snapped;
      }
      var point = it.detach() || !it.snapped && bd.create('point', it.coords.usrCoords.slice(1), attr);
      if (point && bd.pendings) {
        bd.pendings.push(point);
      }
      return point;
    };

    this.createPoints = function(attr) {
      var self = this,
          ret = bd.snaps.map(function(item) {
            return self.createPoint(item, true, attr);
          });
      bd.snaps.length = 0;
      return ret;
    };

    this.submit = function(creation) {
      var self = this, sp;
      try {
        self.clearDrafts();
        bd.pendings = [];
        sp = creation();
        if (sp) {
          if (bd.pendings.indexOf(sp) < 0) {
            bd.pendings.push(sp);
          }
          bd.propObj = sp;
        }
      } catch (e) {
        while (bd.pendings.length > 0) {
          bd.board.removeObject(bd.pendings.pop());
        }
        throw e;
      } finally {
        bd.pendings = null;
        self.clearDraftCoords();
      }
    };

    this.getMouseCoords = function(e) {
      var absPos = JXG.getPosition(e),
          lt = bd.board.getCoordsTopLeftCorner(),
          dx = absPos[0] - lt[0],
          dy = absPos[1] - lt[1];
      return new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], bd.board);
    };

    this.getTouchCoords = function(e, index) {
      var absPos = JXG.getPosition(e, index),
          lt = bd.board.getCoordsTopLeftCorner(),
          dx = absPos[0] - lt[0],
          dy = absPos[1] - lt[1];
      return new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], bd.board);
    };

    this.getEventCoords = function(e) {
      return e[JXG.touchProperty] ? this.getTouchCoords(e, -1) : this.getMouseCoords(e);
    };

  }]);
