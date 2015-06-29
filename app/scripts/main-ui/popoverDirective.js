// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

angular.module('geomeditApp')
  .directive('edPopover', ['$popover', function($popover) {
    'use strict';

    function createPopover(scope, element, contentTemplate) {
      return $popover(element, {
        contentTemplate: contentTemplate,
        html: true,
        trigger: 'manual',
        placement: 'bottom',
        autoClose: true,
        scope: scope
      });
    }

    return {
      link: function(scope, element, attrs) {
        if (attrs.edPopover === 'options') {
          var popover1 = createPopover(scope, element, 'views/options.html');
          scope.showOptionsPopover = function() {
            popover1.show();
          };
        }
      }
    };
  }]);
