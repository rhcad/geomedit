// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .controller('MainCtrl', ['$scope', '$state', '$timeout', 'localStorageService', 'header',
    'commands', 'properties', 'options', 'boardUI',
    function($scope, $state, $timeout, localStorage, header, commands, properties, options, boardUI) {

      $scope.leftButtons = header.leftButtons;
      $scope.rightButtons = header.rightButtons;
      $scope.toolbox = commands;
      $scope.snap = options.snap;
      $scope.zooms = boardUI.zooms;
      header.homeBtn.click = function() { $state.go('home'); };

      $scope.sidebar = {
        views:  [
          { state: 'toolbox',    icon: 'wrench' },
          { state: 'properties', icon: 'sliders' }
        ],
        state:  '',
        hidden: localStorage.get('sidebarHidden'),

        go: function(state, notSave) {
          if (this.state !== state) {
            this.state = state;
            if (!notSave) {
              $state.go('sketch.' + state);
              localStorage.set('sideView', state);
            }
          }
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

      $timeout(function() {
        $scope.sidebar.go($scope.sidebar.state || 'toolbox');
      }, 50);
    }
  ]);
