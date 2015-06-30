// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

angular.module('geomeditApp')
  .service('header', [function() {
    'use strict';
    var _canUndo = false,
        _canRedo = false;

    var undoBtn = {
          tooltip: 'Undo',
          icon: 'reply',
          disabled: function() {
            return !_canUndo;
          },
          click: function() {
            if (!this.disabled()) {
              _canUndo = !_canUndo;
            }
          }
        },
        redoBtn = {
          tooltip: 'Redo',
          icon: 'share',
          disabled: function() {
            return !_canRedo;
          },
          click: function() {
            if (!this.disabled()) {
              _canRedo = !_canRedo;
            }
          }
        },
        optionsBtn = {
          tooltip: 'Options',
          icon: 'cog',
          popover: 'options',
          click: function(scope) { scope.showOptionsPopover(); }
        };

    this.leftButtons = [undoBtn, redoBtn];
    this.rightButtons = [optionsBtn];
  }]);
