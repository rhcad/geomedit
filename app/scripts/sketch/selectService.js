// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .service('select', ['board', function(bd) {
    var newID = 1,
        makeID = function() { return '_aux' + newID++; };

    this.select = function(obj, clear) {
      if (clear) {
        this.resetSelection();
      }

      var newObj = obj ? createHighlightObject(obj) : null,
          highlight = function(newObj) {
            newObj.highlight = angular.noop;
            newObj.reference = obj;
            bd.selection.push(newObj);
          };

      if (newObj) {
        if (JXG.isArray(newObj)) {
          newObj.forEach(highlight);
        }
        else {
          highlight(newObj);
        }
      }
    };

    this.resetSelection = function() {
      while (bd.selection.length > 0) {
        bd.board.removeObject(bd.selection.pop());
      }
    };

    this.highlight = function(obj, show) {
      if (show) {
        this.select(obj);
      }
      else if (obj !== bd.propObj) {
        for (var i = bd.selection.length - 1; i >= 0; i--) {
          if (bd.selection[i].reference === obj) {
            bd.board.removeObject(bd.selection.splice(i, 1)[0]);
          }
        }
      }
    };

    function createHighlightObject(obj) {
      var newObj, attr;

      attr = {
        id:            makeID(),
        name:          '',
        layer:         1,
        withLabel:     false,
        highlighted:   true,
        strokeOpacity: bd.uiOptions.highlightOpacity,
        strokeColor:   bd.uiOptions.highlightColor,
        strokeWidth:   (obj.getAttribute ? obj.getAttribute('strokeWidth') : 0) + bd.uiOptions.highlightSize
      };

      function createForCoords(coords) {
        attr.size = bd.uiOptions.highlightSize;
        attr.strokeWidth = 0;
        attr.snapToGrid = false;
        attr.fillColor = bd.uiOptions.highlightColor;
        attr.fillOpacity = bd.uiOptions.highlightOpacity;
        newObj = bd.create('point', [
          function() { return coords.usrCoords[1]; },
          function() { return coords.usrCoords[2]; }
        ], attr);
      }

      switch (obj.elementClass) {
        case JXG.OBJECT_CLASS_POINT:
          createForCoords(obj.coords);
          break;

        case JXG.OBJECT_CLASS_CIRCLE:
          newObj = bd.create('circle', [obj.center, obj], attr);
          break;

        case JXG.OBJECT_CLASS_LINE:
          attr.straightFirst = obj.getAttribute('straightFirst');
          attr.straightLast = obj.getAttribute('straightLast');
          newObj = bd.create('line', [obj.point1, obj.point2], attr);
          break;

        case JXG.OBJECT_CLASS_CURVE:
          if (obj.type === JXG.OBJECT_TYPE_GRID) {
            attr.strokeOpacity /= 2;
          }
          if (obj.type === JXG.OBJECT_TYPE_ANGLE || obj.type === JXG.OBJECT_TYPE_ARC || obj.type === JXG.OBJECT_TYPE_SECTOR) {
            newObj = bd.create('curve', [obj.dataX, obj.dataY], attr);
            newObj.bezierDegree = 3;
            newObj.prepareUpdate().update().updateRenderer();
          }
          else {
            newObj = bd.create('curve', JXG.coordsArrayToMatrix(obj.points, true), attr);
          }
          break;
      }
      switch (obj.type) {
        case JXG.OBJECT_TYPE_POLYGON:
          newObj = obj.borders.map(function(line) { return createHighlightObject(line); });
          break;

        case JXG.OBJECT_TYPE_TEXT:
          createForCoords(obj.coords);
          break;
      }

      return newObj;
    }

  }]);
