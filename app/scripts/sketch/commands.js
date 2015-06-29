// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

angular.module('geomeditApp')
  .service('commands', ['model', 'motion', 'select', function(model, motion, select) {
    'use strict';
    var _cmdCount = 0, _groups = null;

    this.groups = function() {
      if (_cmdCount !== model.commands.length) {
        _cmdCount = model.commands.length;
        _groups = model.cmdGroups.map(function(group) {
          return { name: group.name, commands: group.commands.map(function(cmd) {
            return cmd.id;
          })};
        });
      }
      return _groups;
    };

    this.active = function() {
      return model.command ? model.command.id : '';
    };

    this.cancel = function() {
      var changed = !!model.command;
      if (model.command) {
        (model.command.cancelled || angular.noop)();
        model.command = null;
        model.context.tip = null;
        model.context.input = null;
        motion.clear();
      }
      return changed;
    };

    this.start = function(id, keepSelection) {
      if (!keepSelection) {
        this.resetSelection();
      }

      var changed = this.cancel();

      model.command = model.findCommand(id);
      if (model.command) {
        if (JXG.isFalse((model.command.inited || angular.noop)())) {
          model.command = null;
        }
        else {
          changed = true;
        }
      }

      return changed;
    };

    this.resetSelection = function() {
      model.propObj = null;
      select.resetSelection();
    };

  }]);
