// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

angular.module('geomeditApp')
  .run(['model', 'motion', 'cmdAux', function(model, motion, cmdAux) {
    'use strict';

    var tip3p = cmdAux.generateTip(['TipClkDragFromPt', 'TipClkDragToP2', 'TipDragToP2', 'TipClkDragToEnd', 'TipDragToEnd']),
        c2tip = cmdAux.generateTip(['TipCircle2p', 'TipClkDragToRadius', 'TipDragToRadius']);

    cmdAux.addCommand3p({ id: 'circle3p', type: 'circumCircle', tip: tip3p,
      clickHandler: function() {
        var triangle = motion.hitTest(cmdAux.snapMasksForTriangle);
        if (triangle && triangle.vertices) {
          motion.submit(function() {
            return model.create('circumCircle', triangle.vertices);
          });
        }
      }
    });
    cmdAux.addCommand3p({ id: 'in_circle', type: 'inCircle', tip: tip3p });
    cmdAux.addLineCommand({ group: 'circle', id: 'circle2p', type: 'circle',
      attrP2: { visible: false },
      tip: function(step) {
        model.context.input = model.context.input || {
          title: 'radius',
          hide: function() {
            return model.context.step > 1;
          }};
        model.context.step = step;
        return c2tip(step);
      },
      clickHandler: function() {
        var input = model.context.input,
            radius = input && !input.hide() && input.value;
        if (radius) {
          motion.submit(function() {
            var center = motion.createPoint(0, true);
            return model.create('circle', [center, radius]);
          });
        }
      }
    });

  }]);
