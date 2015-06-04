// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .service('boardService', ['board', 'eventHandler', function(board, eventHandler) {

    this.initBoard = function(id) {
      board.board = JXG.JSXGraph.initBoard(id, board.initAttr);
      board.board.moveOrigin(board.board.canvasWidth / 2, board.board.canvasHeight / 2);
      JXG.Options = JXG.deepCopy(JXG.Options, board.initOptions);
      eventHandler.registerHandlers();
    };

    this.freeBoard = function() {
      var id;
      if (board.board) {
        id = board.board.containerObj.id;
        eventHandler.unregisterHandlers();
        JXG.JSXGraph.freeBoard(board.board);
        board.board = null;
      }
      return id;
    };

    this.resizeBoard = function(w, h) {
      if (board.board) {
        if (!equals(board.board.canvasWidth, w) || !equals(board.board.canvasHeight, h)) {
          var xcenter = equals(board.board.origin.scrCoords[1], board.board.canvasWidth / 2),
              ycenter = equals(board.board.origin.scrCoords[2], board.board.canvasHeight / 2);

          board.board.resizeContainer(w, h, false, true);
          board.board.applyZoom();
          if (xcenter && ycenter) {
            board.board.moveOrigin(board.board.canvasWidth / 2, board.board.canvasHeight / 2);
          }
        }
      }
    };

    function equals(a, b) {
      return Math.abs(a - b) < 0.1;
    }

  }]);
