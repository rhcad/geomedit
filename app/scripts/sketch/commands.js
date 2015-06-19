// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .service('commands', ['board', 'motion', 'select', function(bd, motion, select) {
    var _cmdCount = 0, _groups = null;

    this.groups = function() {
      if (_cmdCount !== bd.commands.length) {
        _cmdCount = bd.commands.length;
        _groups = bd.cmdGroups.map(function(group) {
          return { name: group.name, commands: group.commands.map(function(cmd) {
            return cmd.id;
          })};
        });
      }
      return _groups;
    };

    this.active = function() {
      return bd.command ? bd.command.id : '';
    };

    this.cancel = function() {
      var changed = !!bd.command;
      if (bd.command) {
        (bd.command.cancelled || angular.noop)();
        bd.command = null;
        motion.clearDrafts();
      }
      return changed;
    };

    this.start = function(id, keepSelection) {
      if (!keepSelection) {
        this.resetSelection();
      }

      if (id === this.active()) {
        return this.cancel();
      }

      var changed = this.cancel();

      bd.command = bd.findCommand(id);
      if (bd.command) {
        var res = (bd.command.inited || angular.noop)();
        if (typeof res === 'boolean' && !res) {
          bd.command = null;
        }
        else {
          changed = true;
        }
      }

      return changed;
    };

    this.resetSelection = function() {
      bd.propObj = null;
      select.resetSelection();
    };

  }]);
