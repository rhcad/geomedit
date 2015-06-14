// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .run(['board', 'motion', function(bd, motion) {

    function downHandler() {
      motion.setDraftCoords(0);
      motion.createDraftPoint(0);
    }

    function upHandler() {
      motion.submit(function() {
        return motion.createPoint(0);
      });
    }

    bd.addCommand({
      id:          'point',
      downHandler: downHandler,
      upHandler:   upHandler
    });

  }]);
