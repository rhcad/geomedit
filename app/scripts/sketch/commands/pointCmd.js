// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .run(['board', 'motion', 'cmdAux', function(bd, motion, cmdAux) {

    cmdAux.addPointCommand('', 'point');
    cmdAux.addPointCommand('', 'midpoint', { mid: true });
    cmdAux.addPointCommand('', 'intersection', { cross: true });

    cmdAux.addCommandSnapSecond('', 'perpPoint', function(v) {
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

    cmdAux.addCommandSnapSecond('', 'reflection', function(v) {
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

    cmdAux.addCommand3p('point', 'in_center', 'incenter');

  }]);
