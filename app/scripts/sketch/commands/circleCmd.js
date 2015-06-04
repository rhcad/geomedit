// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .run(['board', 'motion', function(board, motion) {

    function downHandler() {
      if (motion.pointCount() === 0) {
        motion.addPoint();
        motion.addPoint();
        board.draft[0] = board.board.create('circumcircle', motion.pointWithIndexes(0, 1, 2));
      }
      else if (motion.lastPointIsNew()) {
        motion.addPoint();
      }
      else {
        motion.setPoint();
      }
    }

    function moveHandler() {
      motion.setPoint();
    }

    function upHandler() {
      if (motion.pointCount() === 3 && motion.lastPointIsNew()) {
        motion.clearDraft();
        board.board.create('circumcircle', motion.createPoints());
        motion.clearPoints();
      }
    }

    board.commands.push({
      id:          'circle3p',
      title:       'CmdCircle3',
      downHandler: downHandler,
      moveHandler: moveHandler,
      upHandler:   upHandler
    });

  }]);
