// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .run(['board', 'motion', function(board, motion) {

    function downHandler() {
      if (motion.pointCount() === 0) {
        motion.addPoint();
        motion.addPoint();
        board.draft[0] = board.board.create('segment', motion.pointWithIndexes(0, 1));
      }
      else {
        motion.setPoint();
      }
    }

    function moveHandler() {
      motion.setPoint();
    }

    function upHandler() {
      if (motion.lastPointIsNew()) {
        motion.clearDraft();
        board.board.create('segment', motion.createPoints());
        motion.clearPoints();
      }
    }

    board.commands.push({
      id:          'line',
      title:       'CmdLine',
      downHandler: downHandler,
      moveHandler: moveHandler,
      upHandler:   upHandler
    });

  }]);
