// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .run(['board', 'motion', 'cmdAux', function(bd, motion, cmdAux) {

    cmdAux.addLineCommand('', 'segment', 'segment');
    cmdAux.addLineCommand('', 'ray', 'line', { straightFirst: false });
    cmdAux.addLineCommand('', 'line', 'line');

    cmdAux.addCommandSnapFirst('', 'parallel', { glider: true, gliderFilter: function(el) {
      return el.elementClass === JXG.OBJECT_CLASS_LINE;
    }}, function(start, endPt) {
      return bd.create('parallel', [start.snapped, endPt]);
    });

    cmdAux.addCommand3p('line', 'bisector', 'bisector');

  }]);
