// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .service('commands', ['board', 'motion', 'select', function(bd, motion, select) {
    var _items = null;

    this.items = function() {
      if (!_items || _items.length !== bd.commands.length) {
        _items = bd.commands.map(function(cmd) {
          var title = ('Cmd_' + cmd.id).replace(/_(.)/g, function(match, letter) {
            return letter.toUpperCase();
          });
          return { id: cmd.id, title: title };
        });
      }
      return _items;
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
        bd.propObj = null;
        select.resetSelection();
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

  }]);
