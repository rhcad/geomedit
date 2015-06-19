// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .directive('leftExpandable', ['boardUI', function(boardUI) {
    return {
      link: function(scope, element) {
        var margin = parseFloat(element.css('margin-left')) + 1;

        scope.$watch('sidebar.hidden', function(expanded) {
          element.css('margin-left', expanded ? 0 : margin);
          if (expanded) {
            boardUI.resizeBoard(element.width(), element.height());
          }
        });
        scope.$watchGroup([
            function() { return element.width(); },
            function() { return element.height(); }
          ], function(values) {
            if (!scope.sidebar.hidden) {
              boardUI.resizeBoard(values[0], values[1]);
            }
          }
        );

        var oldResize = window.onresize || angular.noop;
        window.onresize = function() {
          oldResize();
          boardUI.resizeBoard(element.width(), element.height());
        };
      }
    };
  }]);
