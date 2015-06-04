// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .service('commands', ['board', 'motion', function(board, motion) {
    var cmdTitles = null;

    this.items = function() {
      if (!cmdTitles || cmdTitles.length !== board.commands.length) {
        cmdTitles = board.commands.map(function(cmd) {
          return { id: cmd.id, title: cmd.title };
        });
      }
      return cmdTitles;
    };

    this.active = function() {
      return board.command ? board.command.id : '';
    };

    this.cancel = function() {
      var changed = !!board.command;
      if (board.command) {
        (board.command.cancelled || angular.noop)();
        board.command = null;
        motion.clearDraft();
      }
      return changed;
    };

    this.start = function(id) {
      if (id === this.active()) {
        return this.cancel();
      }

      var changed = this.cancel();

      board.command = find(id);
      if (board.command) {
        var res = (board.command.inited || angular.noop)();
        if (typeof res === 'boolean' && !res) {
          board.command = null;
        }
        else {
          changed = true;
        }
      }

      return changed;
    };

    function find(id) {
      var ret = null;
      board.commands.forEach(function(cmd) {
        if (cmd.id === id) {
          ret = cmd;
        }
      });
      return ret;
    }

  }]);
