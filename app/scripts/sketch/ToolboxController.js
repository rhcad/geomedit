// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

angular.module('geomeditApp')
  .controller('ToolboxCtrl', ['$scope', function($scope) {
    'use strict';
    $scope.sidebar.go('toolbox', true);
  }]);

angular.module('geomeditApp')
  .controller('CmdContextCtrl', ['$scope', 'model', function($scope, model) {
    'use strict';
    $scope.context = { applyContext: function() {
      $scope.$applyAsync();
    }};
    model.context = $scope.context;
  }]);
