// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .run(['board', 'motion', function(bd, motion) {
    function addCommand(id, type, attr) {

      function downHandler() {
        if (!motion.hasDraftCoords()) {
          motion.addDraftCoords();
          motion.addDraftCoords();
          bd.drafts.push(bd.create(type, motion.createDraftPoints(0, 1), attr));
        }
        else {
          motion.setDraftCoords();
        }
      }

      function upHandler() {
        if (motion.lastDraftCoordsIsNew()) {
          motion.submit(function() {
            return bd.create(type, motion.createPoints(), attr);
          });
        }
      }

      bd.addCommand({
        id:          id,
        downHandler: downHandler,
        upHandler:   upHandler
      });
    }

    addCommand('segment', 'segment');
    addCommand('ray', 'line', { straightFirst: false });
    addCommand('line', 'line');

  }]);
