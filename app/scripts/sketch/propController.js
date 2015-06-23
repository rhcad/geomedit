// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .controller('PropCtrl', ['$scope', 'properties', 'board', 'select',
    function($scope, properties, bd, select) {
      $scope.options = properties.options;
      $scope.items = properties.items;
      $scope.sidebar.go('properties', true);

      $scope.trimID = function(id) {
        return id.replace(/.*Board\d*/, '');
      };

      $scope.info = function(obj) {
        var ret = {};

        obj = JXG.def(obj, bd.propObj);
        if (obj && obj.getAttribute) {
          ret.id = obj.id;
          ret.type = obj.type;
          ret.elType = obj.type === JXG.OBJECT_TYPE_AXISPOINT ? 'axispoint' :
              obj.type === JXG.OBJECT_TYPE_TICKS ? 'ticks' : obj.elType;
          ret.description = $scope.trimID(ret.id);
          if (ret.description.indexOf(ret.elType) < 0) {
            ret.description += ': ' + ret.elType;
          }
          ret.visible = obj.getAttribute('visible');
        }
        return ret;
      };

      $scope.objects = function() {
        var ret = (bd.board ? bd.board.objectsList : []).filter(function(obj) {
          return properties.validID($scope.trimID(obj.id));
        });
        return ret.reverse();
      };

      $scope.clearSelection = function() {
        bd.propObj = null;
        properties.fetch();
      };

      $scope.selectObject = function(obj) {
        bd.propObj = obj;
        properties.fetch();
      };

      $scope.switchVisible = function(obj) {
        obj = obj ? obj : bd.propObj;
        obj.setAttribute({ visible: !obj.getAttribute('visible') });
      };

      $scope.removeObject = function(obj) {
        select.resetSelection();
        bd.board.removeObject(obj);
      };

      $scope.highlight = function() {
        return select.highlight.apply(select, arguments);
      };

      properties.updateView = function() {
        $scope.$applyAsync();
      };
      $scope.$watch(properties.needSave, function(newValue) {
        if (newValue) {
          properties.save();
        }
      });
    }
  ]);

angular.module('geomeditApp').filter('concatUnit', function() {
  return function(text, unit, maxLen) {
    maxLen = maxLen ? maxLen : 14;
    return text + (unit && text.length < maxLen ? '(' + unit + ')' : '');
  };
});

/**
 * Truncate Filter
 * Usage
 * {{myText|truncate}}
 * {{myText|truncate:5}}
 * {{myText|truncate:25:" ->"}}
 * @Param text
 * @Param length, default is 10
 * @Param end, default is "…"
 * @return string
 */
angular.module('geomeditApp').filter('truncate', function() {
  return function(text, length, end) {
    if (!text) {
      return text;
    }

    length = length ? length : 10;
    end = JXG.def(end, '…');

    if (text.length <= length || text.length - end.length <= length) {
      return text;
    }
    else {
      return text.substring(0, length - end.length) + end;
    }
  };
});

angular.module('geomeditApp').filter('camelCase', function() {
  return function(text, littleCamelCase) {
    text = littleCamelCase ? text : '_' + text;
    return text.replace(/_(.)/g, function(match, letter) {
      return letter.toUpperCase();
    });
  };
});
