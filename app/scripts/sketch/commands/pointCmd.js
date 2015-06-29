// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

angular.module('geomeditApp')
  .run(['model', 'motion', 'cmdAux', function(model, motion, cmdAux) {
    'use strict';

    cmdAux.addPointCommand({ id: 'point' });
    cmdAux.addPointCommand({ id: 'midpoint', snapMasks: { mid: true },
      defaultCreator: function() {
        var line = motion.hitTest(cmdAux.snapMasksForLine);
        if (motion.isSegment(line)) {
          return model.create('midpoint', [line], model.board.options.midpoint);
        }
      }
    });
    cmdAux.addPointCommand({ id: 'intersection', snapMasks: { cross: true }});
    cmdAux.addPointCommand({ id: 'glider', snapMasks: { glider: true }});

    cmdAux.addCommandSnapSecond({ id: 'perpPoint',
      snapFilter: cmdAux.perpendicularFilter,
      attr: model.initOptions.perpendicularPoint,
      tip: cmdAux.generateTip(['TipClkDragStart', 'TipClkDragToLine', 'TipDragToLine'])
    });

    function midCoord(p1, p2, i) {
      return (p1.coords.scrCoords[i] + p2.coords.scrCoords[i]) / 2;
    }

    function midDist(v, pt) {
      var x = midCoord(pt, model.drafts[0], 1) - v.coords.scrCoords[1],
          y = midCoord(pt, model.drafts[0], 2) - v.coords.scrCoords[2];
      return Math.sqrt(x * x + y * y);
    }

    function snapForReflection(v, el) {
      var tmp = model.create('reflection', [model.drafts[0], el]);

      v.dist = midDist(v, tmp);
      if (v.minDist > v.dist) {
        v.minDist = v.dist;
        v.snapped = el;
        if (v.created) {
          model.board.removeObject(v.created);
        }
        v.created = tmp;
      }
      else {
        model.board.removeObject(tmp);
      }
    }

    function snapForMirrorPoint(v, el) {
      var tmp = model.create('mirrorPoint', [el, model.drafts[0]]);

      v.dist = midDist(v, tmp);
      if (v.minDist > v.dist) {
        v.minDist = v.dist;
        v.snapped = el;
        if (v.created) {
          model.board.removeObject(v.created);
        }
        v.created = tmp;
      }
      else {
        model.board.removeObject(tmp);
      }
    }

    cmdAux.addCommandSnapSecond({
      id: 'reflection',
      snapFilter: function(v) {
        v.hits.forEach(function(el) {
          if (model.drafts[0] && el.elementClass === JXG.OBJECT_CLASS_LINE) {
            snapForReflection(v, el);
          }
          else if (model.drafts[0] && JXG.isPoint(el)) {
            snapForMirrorPoint(v, el);
          }
        });
      },
      attr: model.initOptions.perpendicularPoint,
      tip: cmdAux.generateTip(['TipClkDragFromPt', 'TipClkDragToPtLn', 'TipDragToPtLn'])
    });

    cmdAux.addCommand3p({ group: 'point', id: 'in_center', type: 'incenter',
      clickHandler: function() {
        var triangle = motion.hitTest(cmdAux.snapMasksForTriangle);
        if (triangle && triangle.vertices) {
          motion.submit(function() {
            return model.create('incenter', triangle.vertices);
          });
        }
      },
      tip: cmdAux.generateTip(['Tip3triangle', 'TipClkDragToP2', 'TipDragToP2', 'TipClkDragToEnd', 'TipDragToEnd'])
    });

  }]);
