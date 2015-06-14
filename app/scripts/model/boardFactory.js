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
      initOptions: {
        precision:    {
          hasPoint: 8
        },
        point:        {
          withLabel: false
        },
        midpoint:     {
          size:      4,
          face:      '^',
          fillColor: 'none'
        },
        intersection: {
          face: 'x'
        },
        glider:       {
          face:        'diamond',
          fillColor:   '#00dd00',
          strokeColor: '#00dd00'
        }
      },
      uiOptions:   {
        highlightColor:   '#ddd',
        highlightSize:    12,
        highlightOpacity: 0.8
      },
      board:       null,
      drafts:      [],
      snaps:       [],
      pendings:    null,
      propObj:     null,
      selection:   [],
      commands:    [],
      command:     null,
      create:      function(type, parents, attr) {
        return this.board.create(type, parents, attr);
      },
      findCommand: function(id) {
        var ret = null;
        this.commands.forEach(function(cmd) {
          if (cmd.id === id) {
            ret = cmd;
          }
        });
        return ret;
      },
      addCommand:  function(cmd) {
        if (cmd && JXG.isString(cmd.id)) {
          var old = this.findCommand(cmd.id);
          if (old) {
            JXG.extend(old, cmd);
          }
          else {
            this.commands.push(cmd);
          }
        }
      }
    };
  });
