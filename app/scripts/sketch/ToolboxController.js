// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .controller('ToolboxCtrl', ['$scope', function($scope) {
    $scope.sidebar.go('toolbox', true);
  }]);

angular.module('geomeditApp')
  .controller('CmdContextCtrl', ['$scope', 'board', function($scope, bd) {

  }]);
