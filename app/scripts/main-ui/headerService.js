// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .service('header', ['options', 'board', function(options, board) {
    var _canUndo = false,
        _canRedo = false;

    var undoBtn = {
          icon:     'reply',
          disabled: function() { return !_canUndo; },
          click:    function() {
            if (!this.disabled()) {
              _canUndo = !_canUndo;
            }
          }
        },
        redoBtn = {
          icon:     'share',
          disabled: function() { return !_canRedo; },
          click:    function() {
            if (!this.disabled()) {
              _canRedo = !_canRedo;
            }
          }
        },
        dragBtn = {
          icon:     'arrows',
          disabled: function() { return !!board.command; },
          checked:  function() { return !board.command && options.draggable; },
          click:    function() {
            if (!this.disabled()) {
              options.draggable = !options.draggable;
            }
          }
        },/*
        gestureBtn = {
          icon:     'pencil',
          disabled: function() { return true; },
          checked:  function() { return !board.command && options.gestureMode; },
          click:    function() {
            if (!this.disabled()) {
              options.gestureMode = !options.gestureMode;
            }
          }
        },*/
        optionsBtn = {
          icon:    'cog',
          popover: 'options',
          click:   function(scope) { scope.showOptionsPopover(); }
        };

    this.homeBtn = { icon: 'home' };
    this.leftButtons = [undoBtn, redoBtn, dragBtn];
    this.rightButtons = [optionsBtn, this.homeBtn];
  }]);
