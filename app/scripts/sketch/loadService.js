// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .service('loader', ['$q', '$timeout', function($q, $timeout) {
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
    return {
      link: function(scope, element, attrs) {
        loader.load().then(
          function() {
            boardUI.initBoard(attrs.id);
          });
      }
    };
  }]);
