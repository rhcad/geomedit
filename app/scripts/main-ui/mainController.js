// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .controller('MainCtrl', ['$scope', '$state', 'localStorageService', 'header', 'commands', 'properties', 'options', 'boardUI',
    function($scope, $state, localStorage, header, commands, properties, options, boardUI) {

      $scope.leftButtons = header.leftButtons;
      $scope.rightButtons = header.rightButtons;
      $scope.toolbox = commands;
      $scope.snap = options.snap;

      header.homeBtn.click = function() { $state.go('home'); };
      header.cancelBtn.click = function() { commands.cancel(); };
      header.cancelBtn.hide = function() { return header.cancelBtn.disabled(); };
      header.dragBtn.hide = function() { return header.dragBtn.disabled(); };

      $scope.sidebar = {
        views:  [
          { state: 'toolbox',    icon: 'wrench' },
          { state: 'properties', icon: 'sliders' }
        ],
        state:  localStorage.get('sideView'),
        hidden: localStorage.get('sidebarHidden'),

        go: function(state) {
          this.state = state;
          $state.go('sketch.' + state);
          localStorage.set('sideView', state);
        },
        toggleVisible: function() {
          this.hidden = !this.hidden;
          localStorage.set('sidebarHidden', this.hidden);
        }
      };

      $state.get('sketch').onExit = function() {
        boardUI.freeBoard();
      };
      $scope.recreateBoard = function() {
        boardUI.initBoard(boardUI.freeBoard());
        $scope.$applyAsync();
      };

      var propState = $state.get('sketch.properties');
      propState.onEnter = properties.onEnter;
      propState.onExit = properties.onExit;

      $scope.sidebar.go($scope.sidebar.state || 'toolbox');
    }
  ]);
