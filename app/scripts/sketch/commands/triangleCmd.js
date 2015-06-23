// Copyright (c) 2015 Zhang Yungui (https://github.com/rhcad/geomedit/), GPL licensed.

'use strict';

angular.module('geomeditApp')
  .run(['board', 'motion', 'cmdAux', function(bd, motion, cmdAux) {

    cmdAux.addPolygonCommand('', 'triangle', 3, [0, 1, 2]);
    cmdAux.addPolygonCommand('', 'quadrangle', 4, [0, 1, 2, 3]);

  }]);
