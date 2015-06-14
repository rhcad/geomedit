// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .controller('MainCtrl', ['$scope', '$state', 'localStorageService', 'header', 'commands', 'properties', 'options', 'boardService',
    function($scope, $state, localStorage, header, cmds, properties, options, boardService) {

      $scope.leftButtons = header.leftButtons;
      $scope.rightButtons = header.rightButtons;
      header.homeBtn.click = function() { $state.go('home'); };
      $scope.toolbox = cmds;
      $scope.snap = options.snap;

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
        boardService.freeBoard();
      };

      var propState = $state.get('sketch.properties');
      propState.onEnter = properties.onEnter;
      propState.onExit = properties.onExit;

      $scope.sidebar.go($scope.sidebar.state || 'toolbox');
    }
  ]);
