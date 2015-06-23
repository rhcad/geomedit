// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .run(['board', 'motion', 'cmdAux', function(bd, motion, cmdAux) {

    cmdAux.addCommand3p('', 'circle3p', 'circumCircle');
    cmdAux.addCommand3p('', 'in_circle', 'incircle');

    (function() {
      function downHandler() {
        if (!motion.hasDraftCoords()) {
          motion.addDraftCoords();
          motion.addDraftCoords();
          bd.drafts.push(bd.create('circle', motion.createDraftPoints(0, 1)));
        }
        else {
          motion.updateDraftCoords();
        }
      }

      function upHandler() {
        if (motion.lastDraftCoordsIsNew()) {
          motion.submit(function() {
            return bd.create('circle', motion.createPoints());
          });
        }
      }

      bd.addCommand('circle', {
        id:          'circle2p',
        downHandler: downHandler,
        upHandler:   upHandler
      });
    }());

  }]);
