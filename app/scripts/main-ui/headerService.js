// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .service('header', ['options', 'board', function(options, board) {
    var _canUndo = false,
        _canRedo = false;

    var undoBtn = {
          tooltip:  'Undo',
          icon:     'reply',
          disabled: function() { return !_canUndo; },
          click:    function() {
            if (!this.disabled()) {
              _canUndo = !_canUndo;
            }
          }
        },
        redoBtn = {
          tooltip:  'Redo',
          icon:     'share',
          disabled: function() { return !_canRedo; },
          click:    function() {
            if (!this.disabled()) {
              _canRedo = !_canRedo;
            }
          }
        },
        optionsBtn = {
          tooltip: 'Options',
          icon:    'cog',
          popover: 'options',
          click:   function(scope) { scope.showOptionsPopover(); }
        };

    this.dragBtn = {
      tooltip:  'DraggingMode',
      icon:     'arrows',
      disabled: function() { return !!board.command; },
      checked:  function() { return !board.command && options.draggable; },
      click:    function() {
        if (!this.disabled()) {
          options.draggable = !options.draggable;
        }
      }
    };

    this.homeBtn = { tooltip: 'Home', icon: 'home' };
    this.leftButtons = [undoBtn, redoBtn, this.dragBtn, this.cancelBtn];
    this.rightButtons = [optionsBtn, this.homeBtn];
  }]);
