// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .run(['board', 'motion', function(bd, motion) {

    (function() {
      function downHandler() {
        if (!motion.hasDraftCoords()) {
          motion.addDraftCoords();
          motion.addDraftCoords();
          bd.drafts.push(bd.create('circumcircle', motion.createDraftPoints(0, 1, 2)));
        }
        else if (motion.lastDraftCoordsIsNew()) {
          motion.addDraftCoords();
        }
        else {
          motion.setDraftCoords();
        }
      }

      function upHandler() {
        if (motion.draftCoordsCount() === 3 && motion.lastDraftCoordsIsNew()) {
          motion.submit(function() {
            return bd.create('circumcircle', motion.createPoints());
          });
        }
      }

      bd.addCommand({
        id:          'circle3p',
        downHandler: downHandler,
        upHandler:   upHandler
      });
    }());

    (function() {
      function downHandler() {
        if (!motion.hasDraftCoords()) {
          motion.addDraftCoords();
          motion.addDraftCoords();
          bd.drafts.push(bd.create('circle', motion.createDraftPoints(0, 1)));
        }
        else {
          motion.setDraftCoords();
        }
      }

      function upHandler() {
        if (motion.lastDraftCoordsIsNew()) {
          motion.submit(function() {
            return bd.create('circle', motion.createPoints());
          });
        }
      }

      bd.addCommand({
        id:          'circle2p',
        downHandler: downHandler,
        upHandler:   upHandler
      });
    }());

  }]);
