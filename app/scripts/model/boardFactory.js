// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .factory('board', function() {
    return {
      initAttr:    {
        originX:         100,
        originY:         400,
        unitX:           50,
        unitY:           50,
        keepAspectRatio: true,
        axis:            true,
        grid:            true,
        showCopyright:   false,
        showNavigation:  false,
        registerEvents:  false
      },
      board:       null,
      draft:       [],
      commands:    [],
      command:     null,
      initOptions: {
        point: {
          withLabel: false
        }
      }
    };
  });
