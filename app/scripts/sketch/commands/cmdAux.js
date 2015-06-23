// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .service('cmdAux', ['board', 'motion', function(bd, motion) {

    this.addPointCommand = function(group, id, snapMasks) {
      function downHandler() {
        motion.setDraftCoords(0, snapMasks);
        motion.createDraftPoint(0);
      }

      function upHandler() {
        motion.submit(function() {
          var created = motion.getDraftCoords().created;
          return (!snapMasks || JXG.isPoint(created)) && motion.createPoint(0);
        });
      }

      bd.addCommand(group || 'point', {
        id:          id,
        downHandler: downHandler,
        upHandler:   upHandler
      });
    };

    this.addCommandSnapSecond = function(group, id, filter) {
      function downHandler() {
        if (!motion.hasDraftCoords()) {
          motion.addDraftCoords();
          motion.addDraftCoords({ filter: filter });
          bd.drafts.push(bd.create('segment', motion.createDraftPoints(0, 1)));
        }
        else {
          motion.updateDraftCoords();
        }
      }

      function upHandler() {
        if (motion.lastDraftCoordsIsNew()) {
          motion.submit(function() {
            var created = motion.getDraftCoords().created;
            if (JXG.isPoint(created)) {
              var parents = [motion.createPoint(0, true), motion.getDraftCoords().snapped];
              if (created.elType === 'mirrorpoint') {
                parents.reverse();
              }
              return bd.create(created.elType, parents);
            }
          });
        }
      }

      bd.addCommand(group || 'point', {
        id:          id,
        downHandler: downHandler,
        upHandler:   upHandler
      });
    };

    this.addLineCommand = function(group, id, type, attr) {

      function downHandler() {
        if (!motion.hasDraftCoords()) {
          motion.addDraftCoords();
          motion.addDraftCoords();
          bd.drafts.push(bd.create(type, motion.createDraftPoints(0, 1), attr));
        }
        else {
          motion.updateDraftCoords();
        }
      }

      function upHandler() {
        if (motion.lastDraftCoordsIsNew()) {
          motion.submit(function() {
            return bd.create(type, motion.createPoints(), attr);
          });
        }
      }

      bd.addCommand(group || 'line', {
        id:          id,
        downHandler: downHandler,
        upHandler:   upHandler
      });
    };

    this.addCommandSnapFirst = function(group, id, snapMasks, creator) {
      function downHandler() {
        if (!motion.hasDraftCoords()) {
          if (motion.addDraftCoords(snapMasks).snapped) {
            motion.addDraftCoords();
            bd.drafts.push(creator(motion.getDraftCoords(0), motion.createDraftPoint(1)));
          }
          else {
            motion.clearDraftCoords();
          }
        }
        else {
          motion.updateDraftCoords();
        }
      }

      function upHandler() {
        if (motion.lastDraftCoordsIsNew()) {
          motion.submit(function() {
            return creator(motion.getDraftCoords(0), motion.createPoint(1, true));
          });
        }
      }

      bd.addCommand(group || 'line', {
        id:          id,
        downHandler: downHandler,
        upHandler:   upHandler
      });
    };

    this.addCommand3p = function(group, id, type) {
      var points;

      function downHandler() {
        if (!motion.hasDraftCoords()) {
          motion.addDraftCoords();
          motion.addDraftCoords();
          points = motion.createDraftPoints(0, 1, 2);
        }
        else if (motion.lastDraftCoordsIsNew()) {
          motion.addDraftCoords();
          bd.drafts.push(bd.create(type, points));
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
    };

    this.addPolygonCommand = function(group, id, maxcount, indexes) {

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

      bd.addCommand(group || 'polygon', {
        id:          id,
        downHandler: downHandler,
        upHandler:   upHandler
      });
    };

  }]);
