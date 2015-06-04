// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .controller('MainCtrl', ['$scope', '$state', '$translate', 'localStorageService', 'header', 'commands', 'properties', 'options',
    function($scope, $state, $translate, localStorage, header, cmds, properties, options) {

      $scope.leftButtons = header.leftButtons;
      $scope.rightButtons = header.rightButtons;
      $scope.toolbox = cmds;
      $scope.properties = properties.properties;
      $scope.snap = options.snap;

      $scope.sidebar = {
        views:  [
          { state: 'toolbox',    icon: 'wrench' },
          { state: 'properties', icon: 'list-alt' }
        ],
        state:  '',
        hidden: localStorage.get('sidebarHidden'),

        go: function(state) {
          this.state = state;
          $state.go(state);
        },
        toggleVisible: function() {
          this.hidden = !this.hidden;
          localStorage.set('sidebarHidden', this.hidden);
        }
      };
      $scope.sidebar.go('toolbox');
      $translate.use(localStorage.get('lang'));

      $scope.switchLanguage = function(lang) {
        $translate.use(lang);
        localStorage.set('lang', lang);
      };
    }
  ]);
