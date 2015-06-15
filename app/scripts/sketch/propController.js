// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .controller('PropCtrl', ['$scope', 'properties', 'board', 'select',
    function($scope, properties, bd, select) {
      $scope.faces = properties.faces;
      $scope.colors = properties.colors;
      $scope.items = properties.items;

      $scope.trimID = function(id) {
        return id.replace(/.*Board\d?/, '');
      };

      $scope.info = function() {
        var ret = { id: properties.id };
        ret.type = bd.propObj ? bd.propObj.elType : '';
        ret.description = ret.type + ': ' + $scope.trimID(ret.id);
        return ret;
      };

      $scope.objects = function() {
        var ret = (bd.board ? bd.board.objectsList : []).filter(function(obj) {
          var id = $scope.trimID(obj.id);
          return id.indexOf('_') !== 0 && !id.match(/_ticks_/);
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
        obj.setAttribute({ visible: !obj.getAttribute('visible') });
      };

      $scope.removeObject = function(obj) {
        select.resetSelection();
        bd.board.removeObject(obj);
      };

      $scope.highlight = function() {
        return select.highlight.apply(select, arguments);
      };

      properties.updateView = function () {
        $scope.$applyAsync();
      };
      $scope.$watch(properties.needSave, function (newValue) {
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
    length = length ? length : 10;
    end = end === undefined ? '…' : end;

    if (text.length <= length || text.length - end.length <= length) {
      return text;
    }
    else {
      return text.substring(0, length-end.length) + end;
    }
  };
});
