// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

angular.module('geomeditApp')
  .controller('MainCtrl', ['$scope', '$state', 'header', 'sidebar',
    'commands', 'properties', 'model', 'boardUI',
    function($scope, $state, header, sidebar, commands, properties, model, boardUI) {
      'use strict';

      $scope.leftButtons = header.leftButtons;
      $scope.rightButtons = header.rightButtons;
      $scope.toolbox = commands;
      $scope.snap = model.snap;
      $scope.zooms = boardUI.zooms;
      header.homeBtn.click = function() {
        $state.go('home');
      };
      $scope.tooltip = { show: !JXG.isApple() };
      $scope.sidebar = sidebar;

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

      sidebar.showDefaultView();
    }
  ]);

angular.module('geomeditApp')
  .factory('sidebar', ['$state', '$timeout', 'localStorageService', function($state, $timeout, localStorage) {
    'use strict';
    return {
      views: [
        { state: 'toolbox', icon: 'wrench' },
        { state: 'properties', icon: 'sliders' }
      ],
      state: '',
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
      },
      showDefaultView: function() {
        var self = this;
        this.state = '';
        $timeout(function() {
          if (!self.state) {
            self.go(localStorage.get('sideView') || 'toolbox');
          }
        }, 50);
      }
    };
  }]);
