// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .controller('RootCtrl', ['$scope', '$state', '$translate', 'localStorageService',
    function($scope, $state, $translate, localStorage) {

      $translate.use(localStorage.get('lang'));
      $scope.switchLanguage = function(lang) {
        $translate.use(lang);
        localStorage.set('lang', lang);
      };
    }
  ]);
