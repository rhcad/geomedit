// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .factory('options', function() {
    return {
      draggingMode: true,
      gestureMode:  true,
      activeTool:   '',
      snap:         {
        vertex: true,
        mid:    true,
        center: true,
        cross:  true,
        glider: true,

        items: [
          { type: 'switch', id: 'vertex', title: 'SnapVertex' },
          { type: 'switch', id: 'mid',    title: 'SnapMid' },
          { type: 'switch', id: 'center', title: 'SnapCenter' },
          { type: 'switch', id: 'cross',  title: 'SnapCross' },
          { type: 'switch', id: 'glider', title: 'SnapGlider' }
        ]
      }
    };
  });
