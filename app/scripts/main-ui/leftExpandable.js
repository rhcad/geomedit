// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

angular.module('geomeditApp')
  .directive('leftExpandable', ['boardUI', function(boardUI) {
    'use strict';
    return {
      link: function(scope, element) {
        function atBottom() {
          return element.css('position') === 'absolute';
        }

        function expandBoard(expanded) {
          if (atBottom()) {
            element.css('bottom', expanded ? 0 : margin + 1);
            element.css('margin-left', 0);
          }
          else {
            element.css('bottom', 'auto');
            element.css('margin-left', expanded ? 0 : margin + 1);
          }
          if (expanded) {
            boardUI.resizeBoard(element.width(), element.height());
          }
        }

        var margin = parseInt(element.css('margin-left')) || parseInt(element.css('bottom'));

        scope.$watch('sidebar.hidden', expandBoard);
        scope.$watchGroup([
            function() {
              return element.width();
            },
            function() {
              return element.height();
            }
          ], function(values) {
            if (!scope.sidebar.hidden) {
              boardUI.resizeBoard(values[0], values[1]);
            }
          }
        );

        var oldResize = window.onresize || angular.noop;
        window.onresize = function() {
          if (window.DeviceOrientationEvent) {
            expandBoard(scope.sidebar.hidden);
          }
          oldResize();
          boardUI.resizeBoard(element.width(), element.height());
        };
      }
    };
  }]);
