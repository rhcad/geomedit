// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .service('eventHandler', ['board', 'options', 'motion', function(board, options, motion) {
    var downEvent, upEvent, moveEvent;

    this.registerHandlers = function() {
      if (JXG.supportsPointerEvents()) {
        if (window.navigator.pointerEnabled) {
          downEvent = 'pointerdown';
          upEvent = 'pointerup';
          moveEvent = 'pointermove';
        }
        else {
          downEvent = 'MSPointerDown';
          upEvent = 'MSPointerUp';
          moveEvent = 'MSPointerMove';
        }
        JXG.Options.device = 'msie';
      }
      else if ((JXG.isTouchDevice() || JXG.isFirefoxOS()) && typeof Qt !== 'object') {
        downEvent = 'touchstart';
        upEvent = 'touchend';
        moveEvent = 'touchmove';
        JXG.Options.device = 'tablet';
      }
      else {
        downEvent = 'mousedown';
        upEvent = 'mouseup';
        moveEvent = 'mousemove';
        JXG.Options.device = 'pc';
      }

      if (JXG.supportsPointerEvents()) {
        this.addPointerHandlers();
      }
      else {
        this.addMouseHandlers();
        this.addTouchHandlers();
      }
      JXG.addEvent(board.board.containerObj, downEvent, this.downEventHandler, this);
      JXG.addEvent(board.board.containerObj, moveEvent, this.moveEventHandler, this);
      JXG.addEvent(board.board.containerObj, upEvent, this.upEventHandler, this);
    };

    this.unregisterHandlers = function() {
      this.removePointerHandlers();
      this.removeMouseHandlers();
      this.removeTouchHandlers();
      JXG.removeEvent(board.board.containerObj, downEvent, this.downEventHandler, this);
      JXG.removeEvent(board.board.containerObj, moveEvent, this.moveEventHandler, this);
      JXG.removeEvent(board.board.containerObj, upEvent, this.upEventHandler, this);
      motion.clear();
    };

    function preventDefault(e) { e.preventDefault(); }

    this.addPointerHandlers = function() {
      if (window.navigator.pointerEnabled) {
        JXG.addEvent(board.board.containerObj, 'pointermove', board.board.pointerMoveListener, board.board);
      }
      else {
        JXG.addEvent(board.board.containerObj, 'MSPointerMove', board.board.pointerMoveListener, board.board);
      }

      board.board.containerObj.addEventListener('MSHoldVisual', preventDefault, false);
      board.board.containerObj.addEventListener('contextmenu', preventDefault, false);
      board.board.containerObj.addEventListener('selectstart', preventDefault, false);

      this.jsxgraphDownHandler = function() {
        return board.board.pointerDownListener.apply(board.board, arguments);
      };
      board.board.hasPointerHandlers = true;
    };

    this.addMouseHandlers = function() {
      if (!board.board.hasMouseHandlers && JXG.isBrowser) {
        JXG.addEvent(board.board.containerObj, 'mousemove', board.board.mouseMoveListener, board.board);
        board.board.containerObj.addEventListener('contextmenu', preventDefault, false);

        this.jsxgraphDownHandler = function() {
          board.board.mouseDownListener.apply(board.board, arguments);
        };
        board.board.hasMouseHandlers = true;
      }
    };

    this.addTouchHandlers = function() {
      if (!board.board.hasTouchHandlers && JXG.isBrowser) {
        JXG.addEvent(board.board.containerObj, 'touchmove', board.board.touchMoveListener, board.board);
        board.board.hasTouchHandlers = true;
      }
    };

    this.removePointerHandlers = function() {
      if (board.board.hasPointerHandlers) {
        if (window.navigator.pointerEnabled) {
          JXG.removeEvent(board.board.containerObj, 'pointermove', board.board.pointerMoveListener, board.board);
        }
        else {
          JXG.removeEvent(board.board.containerObj, 'MSPointerMove', board.board.pointerMoveListener, board.board);
        }
        board.board.hasPointerHandlers = false;
      }
    };

    this.removeMouseHandlers = function() {
      if (board.board.hasMouseHandlers) {
        JXG.removeEvent(board.board.containerObj, 'mousemove', board.board.mouseMoveListener, board.board);
        board.board.hasMouseHandlers = false;
      }
    };

    this.removeTouchHandlers = function() {
      if (board.board.hasTouchHandlers) {
        JXG.removeEvent(board.board.containerObj, 'touchmove', board.board.touchMoveListener, board.board);
        board.board.hasTouchHandlers = false;
      }
    };

    this.downEventHandler = function(e) {
      if (board.board.hasMouseHandlers && e[JXG.touchProperty]) {
        this.removeMouseHandlers();
        this.jsxgraphDownHandler = function() {
          board.board.touchStartListener.apply(board.board, arguments);
        };
        board.board.hasMouseHandlers = false;
      }

      motion.updateStartCoords(e);
      motion.dragging = true;

      if (board.command) {
        (board.command.downHandler || angular.noop)();
        updateDraftCurves();
      }
      else if (options.draggingMode) {
        (this.jsxgraphDownHandler || angular.noop)(e);
      }
    };

    this.moveEventHandler = function(e) {
      if (motion.dragging) {
        motion.updateCoords(e);
        if (board.command) {
          (board.command.moveHandler || angular.noop)();
          updateDraftCurves();
          motion.lastPt = motion.pt;
        }
      }
    };

    this.upEventHandler = function(e) {
      motion.updateCoords(e);
      motion.dragging = false;
      if (board.command) {
        (board.command.upHandler || angular.noop)();
        updateDraftCurves();
      }
    };

    function updateDraftCurves() {
      board.board.update();
    }

  }]);
