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
