// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

angular.module('geomeditApp')
  .service('boardUI', ['model', 'eventHandler', 'select', function(model, eventHandler, select) {
    'use strict';

    this.initBoard = function(id) {
      JXG.Options.axis = JXG.deepCopy(JXG.Options.axis, model.initOptions.axis);
      model.board = JXG.JSXGraph.initBoard(id, model.initAttr);
      model.board.moveOrigin(model.board.canvasWidth / 2, model.board.canvasHeight / 2);
      model.board.options = JXG.deepCopy(model.board.options, model.initOptions);
      eventHandler.registerHandlers();
    };

    this.freeBoard = function() {
      var id;
      if (model.board) {
        id = model.board.containerObj.id;
        eventHandler.unregisterHandlers();

        model.propObj = null;
        select.resetSelection();

        JXG.JSXGraph.freeBoard(model.board);
        model.board = null;
      }
      return id;
    };

    this.resizeBoard = function(w, h) {
      if (model.board && (!equals(model.board.canvasWidth, w) || !equals(model.board.canvasHeight, h))) {
        var xcSame = equals(model.board.origin.scrCoords[1], model.board.canvasWidth / 2),
            ycSame = equals(model.board.origin.scrCoords[2], model.board.canvasHeight / 2);

        model.board.resizeContainer(w, h, false, true);
        model.board.applyZoom();
        if (xcSame || ycSame) {
          model.board.moveOrigin(xcSame ? model.board.canvasWidth / 2 : model.board.origin.scrCoords[1],
            ycSame ? model.board.canvasHeight / 2 : model.board.origin.scrCoords[2]);
        }
      }
    };

    this.zooms = {
      zoomDefault: function() {
        model.board.moveOrigin(model.board.canvasWidth / 2, model.board.canvasHeight / 2);
        return model.board.zoom100();
      },
      zoomIn: function() {
        return model.board.zoomIn();
      },
      zoomOut: function() {
        return model.board.zoomOut();
      },
      clickLeftArrow: function() {
        return model.board.clickLeftArrow();
      },
      clickRightArrow: function() {
        return model.board.clickRightArrow();
      },
      clickUpArrow: function() {
        return model.board.clickUpArrow();
      },
      clickDownArrow: function() {
        return model.board.clickDownArrow();
      }
    };

    function equals(a, b, tol) {
      return Math.abs(a - b) < JXG.def(tol, 1);
    }

  }]);
