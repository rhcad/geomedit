// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .service('boardUI', ['board', 'eventHandler', 'select', function(bd, eventHandler, select) {

    this.initBoard = function(id) {
      JXG.Options.axis = JXG.deepCopy(JXG.Options.axis, bd.initOptions.axis);
      bd.board = JXG.JSXGraph.initBoard(id, bd.initAttr);
      bd.board.moveOrigin(bd.board.canvasWidth / 2, bd.board.canvasHeight / 2);
      bd.board.options = JXG.deepCopy(bd.board.options, bd.initOptions);
      eventHandler.registerHandlers();
    };

    this.freeBoard = function() {
      var id;
      if (bd.board) {
        id = bd.board.containerObj.id;
        eventHandler.unregisterHandlers();

        bd.propObj = null;
        select.resetSelection();

        JXG.JSXGraph.freeBoard(bd.board);
        bd.board = null;
      }
      return id;
    };

    this.resizeBoard = function(w, h) {
      if (bd.board) {
        if (!equals(bd.board.canvasWidth, w) || !equals(bd.board.canvasHeight, h)) {
          var xcSame = equals(bd.board.origin.scrCoords[1], bd.board.canvasWidth / 2),
              ycSame = equals(bd.board.origin.scrCoords[2], bd.board.canvasHeight / 2);

          bd.board.resizeContainer(w, h, false, true);
          bd.board.applyZoom();
          if (xcSame || ycSame) {
            bd.board.moveOrigin(xcSame ? bd.board.canvasWidth / 2 : bd.board.origin.scrCoords[1],
              ycSame ? bd.board.canvasHeight / 2 : bd.board.origin.scrCoords[2]);
          }
        }
      }
    };

    this.zooms = {
      zoomDefault: function() {
        return bd.board.zoom100();
      },
      zoomIn:      function() {
        return bd.board.zoomIn();
      },
      zoomOut:     function() {
        return bd.board.zoomOut();
      }
    };

    function equals(a, b, tol) {
      return Math.abs(a - b) < JXG.def(tol, 1);
    }

  }]);
