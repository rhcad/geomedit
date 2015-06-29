// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

angular.module('geomeditApp')
  .service('eventHandler', ['model', 'motion', function(model, motion) {
    'use strict';
    var downEvent, upEvent, moveEvent;
    this.touchMode = false;
    this.customDownHandlers = [];
    this.customMoveHandlers = [];

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
      JXG.addEvent(model.board.containerObj, downEvent, this.downEventHandler, this);
      JXG.addEvent(model.board.containerObj, moveEvent, this.moveEventHandler, this);
      JXG.addEvent(model.board.containerObj, upEvent, this.upEventHandler, this);
    };

    this.unregisterHandlers = function() {
      this.removePointerHandlers();
      this.removeMouseHandlers();
      this.removeTouchHandlers();
      JXG.removeEvent(model.board.containerObj, downEvent, this.downEventHandler, this);
      JXG.removeEvent(model.board.containerObj, moveEvent, this.moveEventHandler, this);
      JXG.removeEvent(model.board.containerObj, upEvent, this.upEventHandler, this);
      motion.clear();
    };

    function preventDefault(e) {
      e.preventDefault();
    }

    this.addPointerHandlers = function() {
      if (!model.board.hasPointerHandlers && JXG.isBrowser) {
        JXG.addEvent(model.board.containerObj, moveEvent, model.board.pointerMoveListener, model.board);

        model.board.containerObj.addEventListener('MSHoldVisual', preventDefault, false);
        model.board.containerObj.addEventListener('contextmenu', preventDefault, false);
        model.board.containerObj.addEventListener('selectstart', preventDefault, false);

        this.jxgDownHandler = function() {
          return model.board.pointerDownListener.apply(model.board, arguments);
        };
        model.board.hasPointerHandlers = true;
        this.touchMode = true;
      }
    };

    this.addMouseHandlers = function() {
      if (!model.board.hasMouseHandlers && JXG.isBrowser) {
        JXG.addEvent(model.board.containerObj, 'mousemove', model.board.mouseMoveListener, model.board);
        model.board.containerObj.addEventListener('contextmenu', preventDefault, false);

        this.jxgDownHandler = function() {
          model.board.mouseDownListener.apply(model.board, arguments);
        };
        model.board.hasMouseHandlers = true;
      }
    };

    this.addTouchHandlers = function() {
      if (!model.board.hasTouchHandlers && JXG.isBrowser) {
        JXG.addEvent(model.board.containerObj, 'touchmove', model.board.touchMoveListener, model.board);
        model.board.hasTouchHandlers = true;
      }
    };

    this.removePointerHandlers = function() {
      if (model.board.hasPointerHandlers) {
        JXG.removeEvent(model.board.containerObj, moveEvent, model.board.pointerMoveListener, model.board);
        model.board.containerObj.removeEventListener('MSHoldVisual', preventDefault, false);
        model.board.containerObj.removeEventListener('contextmenu', preventDefault, false);
        model.board.containerObj.removeEventListener('selectstart', preventDefault, false);
        model.board.hasPointerHandlers = false;
      }
    };

    this.removeMouseHandlers = function() {
      if (model.board.hasMouseHandlers) {
        JXG.removeEvent(model.board.containerObj, 'mousemove', model.board.mouseMoveListener, model.board);
        model.board.containerObj.removeEventListener('contextmenu', preventDefault, false);
        model.board.hasMouseHandlers = false;
      }
    };

    this.removeTouchHandlers = function() {
      if (model.board.hasTouchHandlers) {
        JXG.removeEvent(model.board.containerObj, 'touchmove', model.board.touchMoveListener, model.board);
        model.board.hasTouchHandlers = false;
      }
    };

    this.downEventHandler = function(e) {
      if (model.board.hasMouseHandlers && e[JXG.touchProperty]) {
        this.removeMouseHandlers();
        this.jxgDownHandler = function() {
          model.board.touchStartListener.apply(model.board, arguments);
        };
        model.board.hasMouseHandlers = false;
        this.touchMode = true;
      }

      updatePrecision(this.touchMode);
      motion.updateStartCoords(e);
      motion.dragging = true;

      if (model.command) {
        (model.command.downHandler || angular.noop)();
        model.board.update();
      }
      else if (model.draggable) {
        (this.jxgDownHandler || angular.noop)(e);
      }

      // Call $tooltip.hide() via click
      angular.element('body').click();
      this.customDownHandlers.forEach(function(handler) {
        handler(e);
      });
    };

    function updatePrecision(touchMode) {
      if (touchMode) {
        model.board.options.precision.hasPoint = model.board.options.precision.touch;
      }
      else if (model.snap.project) {
        model.board.options.precision.hasPoint = model.board.options.precision.touch / 2;
      }
    }

    this.moveEventHandler = function(e) {
      if (motion.dragging) {
        updatePrecision(this.touchMode);
        motion.updateCoords(e);

        this.customMoveHandlers.forEach(function(handler) {
          handler(e);
        });

        if (model.command) {
          if (model.command.moveHandler) {
            model.command.moveHandler();
          }
          else if (motion.hasDraftCoords()) {
            motion.updateDraftCoords();
          }
          model.board.update();
          motion.lastPt = motion.pt;
        }
      }
    };

    this.upEventHandler = function(e) {
      if (motion.dragging) {
        motion.updateCoords(e);
        motion.dragging = false;
        if (model.command) {
          (model.command.upHandler || angular.noop)();
          if (motion.hasDraftCoords() && !motion.lastDraftCoordsIsNew() && model.command.clickHandler) {
            model.command.clickHandler();
          }
          model.board.update();
        }
      }
    };

  }]);
