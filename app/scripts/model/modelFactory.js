// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

angular.module('geomeditApp')
  .factory('model', function() {
    'use strict';
    return {
      snap: {
        point: true,
        mid: true,
        cross: true,
        glider: true,
        project: false,

        items: [
          { type: 'switch', id: 'point',   title: 'SnapPoint' },
          { type: 'switch', id: 'mid',     title: 'SnapMid' },
          { type: 'switch', id: 'cross',   title: 'SnapCross' },
          { type: 'switch', id: 'glider',  title: 'SnapGlider' },
          { type: 'switch', id: 'project', title: 'ProjectMode' }
        ]
      },
      initAttr: {
        originX: 100,
        originY: 400,
        unitX: 20,
        unitY: 20,
        keepAspectRatio: true,
        axis: true,
        grid: true,
        showCopyright: false,
        showNavigation: false,
        registerEvents: false
      },
      initOptions: {
        board: {
          ignoreLabels: false
        },
        axis: {
          label: {
            position: 'rt',
            offset: [-10, -10]
          },
          ticks: {
            insertTicks: false,
            ticksDistance: 5,
            majorHeight: 30
          }
        },
        label: {
          fixed: false
        },
        precision: {
          hasPoint: 8
        },
        point: {
          withLabel: false
        },
        midpoint: {
          size: 4,
          face: '^',
          fillColor: 'none'
        },
        intersection: {
          face: 'x'
        },
        perpendicularPoint: {
          face: '[]',
          fillColor: '#00dd00',
          strokeColor: '#00dd00'
        },
        perpendicularsegment: {
          point: {
            face: '[]',
            fillColor: '#00dd00',
            strokeColor: '#00dd00'
          }
        },
        glider: {
          face: 'diamond',
          fillColor: '#00dd00',
          strokeColor: '#00dd00'
        },
        polygon: {
          hasInnerPoints: true
        },
        regularpolygon: {
          hasInnerPoints: true,
          vertices: {
            withLabel: false,
            face: '[]',
            fillColor: '#00dd00',
            strokeColor: '#00dd00'
          }
        }
      },
      uiOptions: {
        highlightColor: '#ddd',
        highlightSize: 12,
        highlightOpacity: 0.6
      },
      board: null,
      drafts: [],
      snaps: [],
      pendings: null,
      propObj: null,
      selection: [],
      commands: [],
      cmdGroups: [],
      command: null,
      context: {},
      draggable: true,

      create: function(type, parents, attr) {
        return this.board.create(type, parents, attr);
      },

      findCommand: function(id) {
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
      addCommand: function(group, id, cmd) {
        var hasID = id && JXG.isString(id),
            hasGroup = group && JXG.isString(group),
            oldCmd = this.findCommand(id);

        if (hasID && hasGroup) {
          cmd.id = id;
          if (oldCmd) {
            JXG.extend(oldCmd, cmd);
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
