// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .directive('leftExpandable', ['boardService', 'eventHandler', function(boardService, eventHandler) {
    return {
      link: function(scope, element) {
        var margin = element.css('margin-left') + 1;

        scope.$watch('sidebar.hidden', function(expanded) {
          element.css('margin-left', expanded ? 0 : margin);
          boardService.resizeBoard(element.width(), element.height());
        });

        var oldResize = window.onresize || angular.noop;
        window.onresize = function() {
          oldResize();
          boardService.resizeBoard(element.width(), element.height());
        };

        eventHandler.customDownHandlers.push(function() {
          angular.element('body').click();  // Call $tooltip.hide()
        });
      }
    };
  }]);
