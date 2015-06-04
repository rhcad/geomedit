// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .service('motion', ['board', function(board) {
    this.startPt = null;
    this.lastPt = null;
    this.pt = null;
    this.dragging = false;
    this.points = [];
    this.nodes = [];

    this.updateStartCoords = function(e) {
      this.startPt = this.lastPt = this.pt = this.getCoords(e);
    };

    this.updateCoords = function(e) {
      this.pt = this.getCoords(e);
    };

    this.clear = function() {
      this.clearDraft();
      this.clearPoints();
    };

    this.clearPoints = function() {
      this.startPt = this.lastPt = this.pt = null;
      this.points.length = 0;
    };

    this.clearDraft = function() {
      while (board.draft.length > 0) {
        board.board.removeObject(board.draft.pop());
      }
      while (this.nodes.length > 0) {
        board.board.removeObject(this.nodes.pop());
      }
    };

    this.startPtFunc = function() {
      var self = this;
      return function() {
        return self.startPt ? [self.startPt.usrCoords[1], self.startPt.usrCoords[2]] : [0, 0];
      };
    };

    this.currentPtFunc = function() {
      var self = this;
      return function() {
        return self.pt ? [self.pt.usrCoords[1], self.pt.usrCoords[2]] : [0, 0];
      };
    };

    this.getPoint = function(index) {
      index = index < 0 ? this.points.length + index : index;
      return this.points[index];
    };

    this.setPoint = function(index, pt) {
      index = index === undefined ? -1 : index;
      index = index < 0 ? this.points.length + index : index;
      return this.points[index] = pt === undefined ? this.pt : pt;
    };

    this.addPoint = function(pt) {
      return this.points.push(pt === undefined ? this.pt : pt);
    };

    this.pointCount = function() {
      return this.points.length;
    };

    this.lastPointIsNew = function() {
      return this.getPoint(-1).distance(JXG.COORDS_BY_SCREEN, this.getPoint(-2)) > 5;
    };

    this.pointWithIndex = function(index) {
      var self = this;
      return [function() {
        var i = Math.min(index, self.points.length - 1);
        return i < 0 ? 0 : self.points[i].usrCoords[1];
      }, function() {
        var i = Math.min(index, self.points.length - 1);
        return i < 0 ? 0 : self.points[i].usrCoords[2];
      }];
    };

    this.pointWithIndexes = function(indexes) {
      var self = this;
      indexes = JXG.isArray(indexes) ? indexes : Array.prototype.slice.call(arguments);
      return indexes.map(function(i) {
        self.nodes[i] = board.board.create('point', self.pointWithIndex(i), { withLabel: false });
        return self.nodes[i];
      });
    };

    this.createPoint = function(index, attr) {
      return board.board.create('point', [this.points[index].usrCoords[1], this.points[index].usrCoords[2]], attr);
    };

    this.createPoints = function(attr) {
      return this.points.map(function(pt) {
        return board.board.create('point', [pt.usrCoords[1], pt.usrCoords[2]], attr);
      });
    };

    this.jsxgraphDownHandler = function() {
      var el = function() {
        return fn.apply(owner, arguments);
      };
      board.board.touchStartListener.apply(board.board, arguments);
    };

    this.getMouseCoords = function(e) {
      var absPos = JXG.getPosition(e),
          cPos, dx, dy;
      if (board.board) {
        cPos = board.board.getCoordsTopLeftCorner();
        dx = absPos[0] - cPos[0];
        dy = absPos[1] - cPos[1];
        return new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], board.board);
      }
      else {
        return new JXG.Coords(JXG.COORDS_BY_SCREEN, [absPos[0], absPos[1]], board.board);
      }
    };

    this.getTouchCoords = function(e, index) {
      var absPos = JXG.getPosition(e, index),
          cPos, dx, dy;
      if (board.board) {
        cPos = board.board.getCoordsTopLeftCorner();
        dx = absPos[0] - cPos[0];
        dy = absPos[1] - cPos[1];
        return new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], board.board);
      }
      else {
        return new JXG.Coords(JXG.COORDS_BY_SCREEN, [absPos[0], absPos[1]], board.board);
      }
    };

    this.getCoords = function(e) {
      return e[JXG.touchProperty] ? this.getTouchCoords(e, -1) : this.getMouseCoords(e);
    };

    this.getScreenCoordsXY = function(e) {
      var pos = this.getCoords(e);
      return [pos.scrCoords[1], pos.scrCoords[2]];
    };

  }]);
