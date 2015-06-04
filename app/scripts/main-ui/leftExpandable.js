// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .directive('leftExpandable', ['boardService', function(boardService) {
    return {
      link: function(scope, element) {
        var margin = element.css('margin-left');

        scope.$watch('sidebar.hidden', function(expanded) {
          element.css('margin-left', expanded ? 0 : margin);
          boardService.resizeBoard(element.width(), element.height());
        });

        var oldresize = window.onresize || angular.noop;
        window.onresize = function() {
          oldresize();
          boardService.resizeBoard(element.width(), element.height());
        };
      }
    };
  }]);
