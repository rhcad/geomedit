// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

angular.module('geomeditApp')
  .service('select', ['model', function(model) {
    'use strict';
    var newID = 1,
        makeID = function() {
          return '_aux' + newID++;
        };

    this.select = function(obj, clear) {
      if (clear) {
        this.resetSelection();
      }

      var newObj = obj ? createHighlightObject(obj) : null,
          highlight = function(newObj) {
            newObj.highlight = angular.noop;
            newObj.reference = obj;
            model.selection.push(newObj);
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
      while (model.selection.length > 0) {
        model.board.removeObject(model.selection.pop());
      }
    };

    this.highlight = function(obj, show) {
      if (show) {
        this.select(obj);
      }
      else if (obj !== model.propObj) {
        for (var i = model.selection.length - 1; i >= 0; i--) {
          if (model.selection[i].reference === obj) {
            model.board.removeObject(model.selection.splice(i, 1)[0]);
          }
        }
      }
    };

    function createForCoords(coords, attr) {
      attr.size = model.uiOptions.highlightSize;
      attr.strokeWidth = 0;
      attr.snapToGrid = false;
      attr.fillColor = model.uiOptions.highlightColor;
      attr.fillOpacity = model.uiOptions.highlightOpacity;

      return model.create('point', [function() {
        return coords.usrCoords[1];
      }, function() {
        return coords.usrCoords[2];
      }], attr);
    }

    function createHighlightObject(obj) {
      var newObj, attr;

      attr = {
        id: makeID(),
        name: '',
        layer: 1,
        withLabel: false,
        highlighted: true,
        strokeOpacity: model.uiOptions.highlightOpacity,
        strokeColor: model.uiOptions.highlightColor,
        strokeWidth: (obj.getAttribute ? obj.getAttribute('strokeWidth') : 0) + model.uiOptions.highlightSize
      };

      switch (obj.elementClass) {
        case JXG.OBJECT_CLASS_POINT:
          newObj = createForCoords(obj.coords, attr);
          break;

        case JXG.OBJECT_CLASS_CIRCLE:
          newObj = model.create('circle', [obj.center, obj], attr);
          break;

        case JXG.OBJECT_CLASS_LINE:
          attr.straightFirst = obj.getAttribute('straightFirst');
          attr.straightLast = obj.getAttribute('straightLast');
          newObj = model.create('line', [obj.point1, obj.point2], attr);
          break;

        case JXG.OBJECT_CLASS_CURVE:
          newObj = createForCurve(obj, attr);
          break;

        default:
          break;
      }
      if (!newObj) {
        switch (obj.type) {
          case JXG.OBJECT_TYPE_POLYGON:
            newObj = obj.borders.map(function(line) {
              return createHighlightObject(line);
            });
            break;

          case JXG.OBJECT_TYPE_TEXT:
            newObj = createForCoords(obj.coords, attr);
            break;

          case JXG.OBJECT_TYPE_TICKS:
            newObj = createHighlightObject(obj.line);
            break;

          default:
            break;
        }
      }

      return newObj;
    }

    function createForCurve(obj, attr) {
      var newObj;

      if (obj.type === JXG.OBJECT_TYPE_GRID) {
        attr.strokeOpacity /= 3;
        attr.gridX = obj.getAttribute('gridX') * 5;
        attr.gridY = obj.getAttribute('gridY') * 5;
        attr.topLeft = obj.getAttribute('topLeft');
        attr.bottomRight = obj.getAttribute('bottomRight');
        newObj = model.create('grid', [], attr);
      }
      else {
        if (obj.type === JXG.OBJECT_TYPE_ANGLE || obj.type === JXG.OBJECT_TYPE_ARC || obj.type === JXG.OBJECT_TYPE_SECTOR) {
          newObj = model.create('curve', [obj.dataX, obj.dataY], attr);
          newObj.bezierDegree = 3;
          newObj.prepareUpdate().update().updateRenderer();
        }
        else {
          newObj = model.create('curve', JXG.coordsArrayToMatrix(obj.points, true), attr);
        }
      }

      return newObj;
    }

  }]);
