// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

angular.module('geomeditApp')
  .run(['model', 'motion', 'cmdAux', function(model, motion, cmdAux) {
    'use strict';

    var generateLineTip = function(first) {
          return cmdAux.generateTip([first, 'TipClkDragToEnd', 'TipDragToEnd']);
        },
        lineTip = generateLineTip('TipClkDragStart'),
        parallelTip = generateLineTip('TipClkDragLine'),
        perpTip = cmdAux.generateTip(['TipClkDragStart', 'TipClkDragToLine', 'TipDragToLine']);

    cmdAux.addLineCommand({ id: 'segment', type: 'segment', tip: lineTip });
    cmdAux.addLineCommand({ id: 'ray', type: 'line', tip: lineTip, attr: { straightFirst: false }});
    cmdAux.addLineCommand({ id: 'line', type: 'line', tip: lineTip });

    cmdAux.addCommandSnapFirst({
      id: 'parallel',
      attr: { visible: false },
      tip: parallelTip,
      snapMasks: cmdAux.snapMasksForLine,
      creator: function(start, endPt) {
        return model.create('parallel', [start.snapped, endPt]);
      }
    });

    cmdAux.addCommandSnapSecond({
      group: 'line',
      id: 'perpSegment',
      tip: perpTip,
      snapFilter: cmdAux.perpendicularFilter,
      creator: function(startPt, endSnap) {
        return model.create('perpendicularSegment', [endSnap.snapped, startPt]);
      }
    });

    cmdAux.addCommandSnapSecond({
      group: 'line',
      id: 'perpLine',
      tip: perpTip,
      snapFilter: cmdAux.perpendicularFilter,
      creator: function(startPt, endSnap) {
        return model.create('perpendicular', [endSnap.snapped, startPt]);
      },
      clickHandler: function() {
        var line = motion.hitTest(cmdAux.snapMasksForLine);
        if (line) {
          motion.submit(function() {
            var point = motion.hitTest({ point: true }) || motion.createGlider(line);
            return model.create('perpendicular', [line, point]);
          });
        }
      }
    });

    cmdAux.addCommand3p({ group: 'line', id: 'bisector', type: 'bisector',
      tip: cmdAux.generateTip(['TipClkDragFromPt', 'TipDragToP2', 'TipClkDragToP2', 'TipDragToEnd', 'TipDragToEnd'])
    });

  }]);
