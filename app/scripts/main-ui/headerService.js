// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .service('header', ['options', function(options) {
    var _canUndo = false,
        _canRedo = false;

    var undoBtn = {
          icon:     'reply',
          disabled: function() { return !_canUndo; },
          click:    function() { _canUndo = !_canUndo; }
        },
        redoBtn = {
          icon:     'share',
          disabled: function() { return !_canRedo; },
          click:    function() { _canRedo = !_canRedo; }
        },
        dragBtn = {
          icon:    'arrows',
          checked: function() { return options.draggingMode; },
          click:   function() { options.draggingMode = !options.draggingMode; }
        },
        gestureBtn = {
          icon:    'pencil',
          checked: function() { return options.gestureMode; },
          click:   function() { options.gestureMode = !options.gestureMode; }
        },
        openBtn = {
          icon:  'reorder',
          click: function() {}
        },
        optionsBtn = {
          icon:    'cog',
          popover: 'options',
          click:   function(scope) { scope.showOptionsPopover(); }
        };

    this.leftButtons = [openBtn, undoBtn, redoBtn, dragBtn, gestureBtn];
    this.rightButtons = [optionsBtn];
  }]);
