// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

angular.module('geomeditApp')
  .run(['model', 'motion', 'cmdAux', function(model, motion, cmdAux) {
    'use strict';

    var tip3p = cmdAux.generateTip(['TipClkDragFromPt', 'TipClkDragToP2', 'TipDragToP2', 'TipClkDragToEnd', 'TipDragToEnd']),
        tip4p = cmdAux.generateTip(['TipClkDragFromPt', 'TipClkDragToP2', 'TipDragToP2',
          'TipClkDragToP3', 'TipDragToP3', 'TipClkDragToEnd', 'TipDragToEnd']),
        regularTip = cmdAux.generateTip(['TipClkDragStartR', 'TipDragToEndR', 'TipClkDragToEndR']),
        tips = ['TipClkDragStart', 'TipClkDragToP2', 'TipDragToP2',
          'TipClkDragToP3', 'TipDragToP3', 'TipClkDragToPn', 'TipDragToPn'];

    cmdAux.addPolygonCommand({ id: 'triangle', maxCount: 3, tip: tip3p });
    cmdAux.addPolygonCommand({ id: 'quadrangle', maxCount: 4, tip: tip4p });
    cmdAux.addCommand3p({ group: 'polygon', id: 'parallelogram', type: 'parallelpoint', tip: tip3p,
      afterCreated: function(pt, points) {
        pt.setAttribute({ visible: false });
        model.create('polygon', [points[0], points[1], pt, points[2]]);
      }
    });

    cmdAux.addPolygonCommand({ id: 'polygon', maxCount: 20,
      cancelled: function() {
        while (motion.draftCoordsCount() > 1 && !motion.lastDraftCoordsIsNew()) {
          model.snaps.pop().clear();
        }
        if (motion.draftCoordsCount() > 2) {
          motion.submit(function() {
            return model.create('polygon', motion.createPoints());
          });
        }
      },
      tip: function(step) {
        if (step < 5) {
          return tips[step];
        }
        return tips[step % 2 ? 5 : 6];
      }
    });

    cmdAux.addLineCommand({ group: 'polygon', id: 'regularPolygon', type: 'regularPolygon', tip: regularTip,
      inited: function() {
        model.context.input = { title: 'edges', min: 3, max: 300, value: 3 };
      },
      verifyParents: function(points) {
        var edges = model.context.input.value || 3;
        return points.concat([Math.max(3, edges)]);
      }
    });

  }]);
