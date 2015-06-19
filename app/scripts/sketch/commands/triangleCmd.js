// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .run(['board', 'motion', function(bd, motion) {
    function addCommand(id, maxcount, indexes) {

      function downHandler() {
        if (!motion.hasDraftCoords()) {
          motion.addDraftCoords();
          motion.addDraftCoords();
          bd.drafts.push(bd.create('polygon', motion.createDraftPoints(indexes)));
        }
        else if (motion.lastDraftCoordsIsNew()) {
          motion.addDraftCoords();
          if (motion.lastDraftCoordsIsNew() && motion.draftCoordsCount() < maxcount) {
            motion.addDraftCoords();
          }
        }
        else {
          motion.updateDraftCoords();
        }
      }

      function upHandler() {
        if (motion.draftCoordsCount() === maxcount && motion.lastDraftCoordsIsNew()) {
          motion.submit(function() {
            return bd.create('polygon', motion.createPoints());
          });
        }
      }

      bd.addCommand('polygon', {
        id:          id,
        downHandler: downHandler,
        upHandler:   upHandler
      });
    }

    addCommand('triangle', 3, [0, 1, 2]);
    addCommand('quadrangle', 4, [0, 1, 2, 3]);

  }]);
