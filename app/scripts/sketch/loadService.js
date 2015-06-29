// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

angular.module('geomeditApp')
  .service('loader', ['$q', '$timeout', function($q, $timeout) {
    'use strict';
    this.load = function() {
      var deferred = $q.defer();

      $timeout(function() {
        deferred.resolve();
      }, 50);

      return deferred.promise;
    };
  }]);

angular.module('geomeditApp')
  .directive('newBoard', ['loader', 'boardUI', function(loader, boardUI) {
    'use strict';
    return {
      link: function(scope, element, attrs) {
        loader.load().then(
          function() {
            boardUI.initBoard(attrs.id);
          });
      }
    };
  }]);
