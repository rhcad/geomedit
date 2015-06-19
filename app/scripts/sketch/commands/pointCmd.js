// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .run(['board', 'motion', function(bd, motion) {

    function addCommand(id, snapMasks) {
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

      bd.addCommand('point', {
        id:          id,
        downHandler: downHandler,
        upHandler:   upHandler
      });
    }

    addCommand('point');
    addCommand('midpoint', { mid: true });
    addCommand('intersection', { cross: true });

    function addCommand2(id, filter) {
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
        motion.submit(function() {
          var created = motion.getDraftCoords().created;
          if (motion.lastDraftCoordsIsNew() && JXG.isPoint(created)) {
            var parents = [motion.createPoint(0, true), motion.getDraftCoords().snapped];
            if (created.elType === 'mirrorpoint') {
              parents.reverse();
            }
            return bd.create(created.elType, parents);
          }
        });
      }

      bd.addCommand('point', {
        id:          id,
        downHandler: downHandler,
        upHandler:   upHandler
      });
    }

    addCommand2('perpPoint', function(v) {
      var tmp;
      v.hits.forEach(function(el) {
        if (bd.drafts[0] && el.elementClass === JXG.OBJECT_CLASS_LINE) {
          tmp = bd.create('perpendicularPoint', [bd.drafts[0], el]);

          v.dist = tmp.coords.distance(JXG.COORDS_BY_SCREEN, v.coords);
          if (v.minDist > v.dist) {
            v.minDist = v.dist;
            v.snapped = el;
            if (v.created) {
              bd.board.removeObject(v.created);
            }
            v.created = tmp;
          }
          else {
            bd.board.removeObject(tmp);
          }
        }
      });
    });

    addCommand2('reflection', function(v) {
      var tmp, x, y,
          mid = function(p1, p2, i) {
            return (p1.coords.scrCoords[i] + p2.coords.scrCoords[i]) / 2;
          },
          distTo = function(pt) {
            x = mid(pt, bd.drafts[0], 1) - v.coords.scrCoords[1];
            y = mid(pt, bd.drafts[0], 2) - v.coords.scrCoords[2];
            return Math.sqrt(x * x + y * y);
          };

      v.hits.forEach(function(el) {
        if (bd.drafts[0] && el.elementClass === JXG.OBJECT_CLASS_LINE) {
          tmp = bd.create('reflection', [bd.drafts[0], el]);
          v.dist = distTo(tmp);

          if (v.minDist > v.dist) {
            v.minDist = v.dist;
            v.snapped = el;
            if (v.created) {
              bd.board.removeObject(v.created);
            }
            v.created = tmp;
          }
          else {
            bd.board.removeObject(tmp);
          }
        }
        else if (bd.drafts[0] && JXG.isPoint(el)) {
          tmp = bd.create('mirrorPoint', [el, bd.drafts[0]]);
          v.dist = distTo(tmp);

          if (v.minDist > v.dist) {
            v.minDist = v.dist;
            v.snapped = el;
            if (v.created) {
              bd.board.removeObject(v.created);
            }
            v.created = tmp;
          }
          else {
            bd.board.removeObject(tmp);
          }
        }
      });
    });

    addCommand2('reflection', function(v) {
      var tmp, x, y,
          mid = function(p1, p2, i) {
            return (p1.coords.scrCoords[i] + p2.coords.scrCoords[i]) / 2;
          },
          distTo = function(pt) {
            x = mid(pt, bd.drafts[0], 1) - v.coords.scrCoords[1];
            y = mid(pt, bd.drafts[0], 2) - v.coords.scrCoords[2];
            return Math.sqrt(x * x + y * y);
          };

      v.hits.forEach(function(el) {
        if (bd.drafts[0] && el.elementClass === JXG.OBJECT_CLASS_LINE) {
          tmp = bd.create('reflection', [bd.drafts[0], el]);
          v.dist = distTo(tmp);

          if (v.minDist > v.dist) {
            v.minDist = v.dist;
            v.snapped = el;
            if (v.created) {
              bd.board.removeObject(v.created);
            }
            v.created = tmp;
          }
          else {
            bd.board.removeObject(tmp);
          }
        }
        else if (bd.drafts[0] && JXG.isPoint(el)) {
          tmp = bd.create('mirrorPoint', [el, bd.drafts[0]]);
          v.dist = distTo(tmp);

          if (v.minDist > v.dist) {
            v.minDist = v.dist;
            v.snapped = el;
            if (v.created) {
              bd.board.removeObject(v.created);
            }
            v.created = tmp;
          }
          else {
            bd.board.removeObject(tmp);
          }
        }
      });
    });

  }]);
