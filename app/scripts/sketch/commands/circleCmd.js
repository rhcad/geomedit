// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .run(['board', 'motion', function(bd, motion) {

    function addCommand3p(id, type, group) {
      function downHandler() {
        if (!motion.hasDraftCoords()) {
          motion.addDraftCoords();
          motion.addDraftCoords();
          bd.drafts.push(bd.create(type, motion.createDraftPoints(0, 1, 2)));
        }
        else if (motion.lastDraftCoordsIsNew()) {
          motion.addDraftCoords();
        }
        else {
          motion.updateDraftCoords();
        }
      }

      function upHandler() {
        if (motion.draftCoordsCount() === 3 && motion.lastDraftCoordsIsNew()) {
          motion.submit(function() {
            return bd.create(type, motion.createPoints());
          });
        }
      }

      bd.addCommand(group || 'circle', {
        id:          id,
        downHandler: downHandler,
        upHandler:   upHandler
      });
    }

    addCommand3p('circle3p', 'circumCircle');
    addCommand3p('in_circle', 'incircle');
    addCommand3p('in_center', 'incenter', 'point');

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
