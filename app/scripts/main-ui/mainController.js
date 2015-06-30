// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

angular.module('geomeditApp')
  .controller('MainCtrl', ['$scope', '$state', '$translate', 'localStorageService', 'header', 'sidebar',
    'commands', 'properties', 'model', 'boardUI',
    function($scope, $state, $translate, localStorage, header, sidebar, commands, properties, model, boardUI) {
      'use strict';

      $scope.leftButtons = header.leftButtons;
      $scope.rightButtons = header.rightButtons;
      $scope.toolbox = commands;
      $scope.snap = model.snap;
      $scope.zooms = boardUI.zooms;
      $scope.tooltip = { show: !JXG.isApple() };
      $scope.sidebar = sidebar;

      $scope.$on('$destroy', function() {
        boardUI.freeBoard();
      });
      $scope.recreateBoard = function() {
        boardUI.initBoard(boardUI.freeBoard());
        $scope.$applyAsync();
      };

      var propState = $state.get('properties');
      propState.onEnter = properties.onEnter;
      propState.onExit = properties.onExit;

      sidebar.showDefaultView();

      $translate.use(localStorage.get('lang'));
      $scope.switchLanguage = function(lang) {
        $translate.use(lang);
        localStorage.set('lang', lang);
      };
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
            $state.go(state);
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
