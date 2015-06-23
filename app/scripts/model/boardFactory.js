// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .factory('board', function() {
    return {
      initAttr:    {
        originX:         100,
        originY:         400,
        unitX:           20,
        unitY:           20,
        keepAspectRatio: true,
        axis:            true,
        grid:            true,
        showCopyright:   false,
        showNavigation:  false,
        registerEvents:  false
      },
      initOptions: {
        board:          {
          ignoreLabels: false
        },
        axis:           {
          label: {
            position: 'rt',
            offset:   [-10, -10]
          },
          ticks: {
            insertTicks:   false,
            ticksDistance: 5,
            majorHeight:   30
          }
        },
        label:          {
          fixed: false
        },
        precision:      {
          hasPoint: 8
        },
        point:          {
          withLabel: false
        },
        midpoint:       {
          size:      4,
          face:      '^',
          fillColor: 'none'
        },
        intersection:   {
          face: 'x'
        },
        glider:         {
          face:        'diamond',
          fillColor:   '#00dd00',
          strokeColor: '#00dd00'
        },
        polygon:        {
          hasInnerPoints: true
        },
        regularPolygon: {
          hasInnerPoints: true
        }
      },
      uiOptions:   {
        highlightColor:   '#ddd',
        highlightSize:    12,
        highlightOpacity: 0.6
      },
      board:       null,
      drafts:      [],
      snaps:       [],
      pendings:    null,
      propObj:     null,
      selection:   [],
      commands:    [],
      cmdGroups:   [],
      command:     null,

      create: function(type, parents, attr) {
        return this.board.create(type, parents, attr);
      },

      findCommand:      function(id) {
        var i, n;
        for (i = 0, n = this.commands.length; i < n; i++) {
          if (this.commands[i].id === id) {
            return this.commands[i];
          }
        }
        return null;
      },
      findCommandGroup: function(name) {
        var i, n;
        for (i = 0, n = this.cmdGroups.length; i < n; i++) {
          if (this.cmdGroups[i].name === name) {
            return this.cmdGroups[i];
          }
        }
        return null;
      },
      addCommand:       function(group, cmd) {
        if (cmd && cmd.id && JXG.isString(cmd.id) && group && JXG.isString(group)) {
          var old = this.findCommand(cmd.id);
          if (old) {
            JXG.extend(old, cmd);
          }
          else {
            this.commands.push(cmd);

            var groupObj = this.findCommandGroup(group);
            if (!groupObj) {
              groupObj = { name: group, commands: [] };
              this.cmdGroups.push(groupObj);
            }
            groupObj.commands.push(cmd);
          }
        }
      }
    };
  });
