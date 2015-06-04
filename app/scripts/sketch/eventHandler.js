// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .service('eventHandler', ['board', 'options', 'motion', function(bd, options, motion) {
    var downEvent, upEvent, moveEvent;
    this.touchMode = false;

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
      else if (JXG.isTouchDevice() || JXG.isFirefoxOS()) {
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
      JXG.addEvent(bd.board.containerObj, downEvent, this.downEventHandler, this);
      JXG.addEvent(bd.board.containerObj, moveEvent, this.moveEventHandler, this);
      JXG.addEvent(bd.board.containerObj, upEvent, this.upEventHandler, this);
    };

    this.unregisterHandlers = function() {
      this.removePointerHandlers();
      this.removeMouseHandlers();
      this.removeTouchHandlers();
      JXG.removeEvent(bd.board.containerObj, downEvent, this.downEventHandler, this);
      JXG.removeEvent(bd.board.containerObj, moveEvent, this.moveEventHandler, this);
      JXG.removeEvent(bd.board.containerObj, upEvent, this.upEventHandler, this);
      motion.clear();
    };

    function preventDefault(e) { e.preventDefault(); }

    this.addPointerHandlers = function() {
      if (!bd.board.hasPointerHandlers && JXG.isBrowser) {
        JXG.addEvent(bd.board.containerObj, moveEvent, bd.board.pointerMoveListener, bd.board);

        bd.board.containerObj.addEventListener('MSHoldVisual', preventDefault, false);
        bd.board.containerObj.addEventListener('contextmenu', preventDefault, false);
        bd.board.containerObj.addEventListener('selectstart', preventDefault, false);

        this.jxgDownHandler = function() {
          return bd.board.pointerDownListener.apply(bd.board, arguments);
        };
        bd.board.hasPointerHandlers = true;
        this.touchMode = true;
      }
    };

    this.addMouseHandlers = function() {
      if (!bd.board.hasMouseHandlers && JXG.isBrowser) {
        JXG.addEvent(bd.board.containerObj, 'mousemove', bd.board.mouseMoveListener, bd.board);
        bd.board.containerObj.addEventListener('contextmenu', preventDefault, false);

        this.jxgDownHandler = function() {
          bd.board.mouseDownListener.apply(bd.board, arguments);
        };
        bd.board.hasMouseHandlers = true;
      }
    };

    this.addTouchHandlers = function() {
      if (!bd.board.hasTouchHandlers && JXG.isBrowser) {
        JXG.addEvent(bd.board.containerObj, 'touchmove', bd.board.touchMoveListener, bd.board);
        bd.board.hasTouchHandlers = true;
      }
    };

    this.removePointerHandlers = function() {
      if (bd.board.hasPointerHandlers) {
        JXG.removeEvent(bd.board.containerObj, moveEvent, bd.board.pointerMoveListener, bd.board);
        bd.board.containerObj.removeEventListener('MSHoldVisual', preventDefault, false);
        bd.board.containerObj.removeEventListener('contextmenu', preventDefault, false);
        bd.board.containerObj.removeEventListener('selectstart', preventDefault, false);
        bd.board.hasPointerHandlers = false;
      }
    };

    this.removeMouseHandlers = function() {
      if (bd.board.hasMouseHandlers) {
        JXG.removeEvent(bd.board.containerObj, 'mousemove', bd.board.mouseMoveListener, bd.board);
        bd.board.containerObj.removeEventListener('contextmenu', preventDefault, false);
        bd.board.hasMouseHandlers = false;
      }
    };

    this.removeTouchHandlers = function() {
      if (bd.board.hasTouchHandlers) {
        JXG.removeEvent(bd.board.containerObj, 'touchmove', bd.board.touchMoveListener, bd.board);
        bd.board.hasTouchHandlers = false;
      }
    };

    this.downEventHandler = function(e) {
      if (bd.board.hasMouseHandlers && e[JXG.touchProperty]) {
        this.removeMouseHandlers();
        this.jxgDownHandler = function() {
          bd.board.touchStartListener.apply(bd.board, arguments);
        };
        bd.board.hasMouseHandlers = false;
        this.touchMode = true;
        bd.board.options.precision.hasPoint = bd.board.options.precision.touch;
      }

      motion.updateStartCoords(e);
      motion.dragging = true;

      if (bd.command) {
        (bd.command.downHandler || angular.noop)();
        bd.board.update();
      }
      else if (options.draggable) {
        (this.jxgDownHandler || angular.noop)(e);
      }
    };

    this.moveEventHandler = function(e) {
      if (motion.dragging) {
        if (this.touchMode) {
          bd.board.options.precision.hasPoint = bd.board.options.precision.touch;
        }
        motion.updateCoords(e);
        if (bd.command) {
          if (bd.command.moveHandler) {
            bd.command.moveHandler();
          }
          else if (motion.hasDraftCoords()) {
            motion.setDraftCoords();
          }
          bd.board.update();
          motion.lastPt = motion.pt;
        }
      }
    };

    this.upEventHandler = function(e) {
      motion.updateCoords(e);
      motion.dragging = false;
      if (bd.command) {
        (bd.command.upHandler || angular.noop)();
        bd.board.update();
      }
    };

  }]);
