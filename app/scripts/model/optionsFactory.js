// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .factory('options', function() {
    return {
      draggable:   true,
      gestureMode: true,
      activeTool:  '',
      snap:        {
        vertex:  true,
        mid:     true,
        cross:   true,
        glider:  true,
        project: false,

        items: [
          { type: 'switch', id: 'vertex',  title: 'SnapVertex' },
          { type: 'switch', id: 'mid',     title: 'SnapMid' },
          { type: 'switch', id: 'cross',   title: 'SnapCross' },
          { type: 'switch', id: 'glider',  title: 'SnapGlider' },
          { type: 'switch', id: 'project', title: 'ProjectMode' }
        ]
      }
    };
  });
