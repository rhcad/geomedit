'use strict';

angular.module('geomeditApp')
  .config(['$translateProvider', function($translateProvider) {
    var lang = navigator ? (navigator.language || navigator.userLanguage) : null;

    $translateProvider
      .translations('en', {
        Languages:   'UI Language',
        SnapOptions: 'Snapping Options',
        SnapVertex:  'Snap to vertex',
        SnapMid:     'Snap to midpoint',
        SnapCross:   'Snap to intersection',
        SnapGlider:  'Snap to edge',

        Loading:       'Loading...',
        Cmd_:          'Select',
        CmdPoint:      'Point',
        CmdSegment:    'Segment',
        CmdRay:        'Ray line',
        CmdLine:       'Infinite line',
        CmdTriangle:   'Triangle',
        CmdQuadrangle: 'Quadrangle',
        CmdCircle2p:   'Circle with center',
        CmdCircle3p:   'Circle through three points'
      })
      .translations('cn', {
        Languages:   '界面语言',
        SnapOptions: '捕捉选项',
        SnapVertex:  '允许捕捉顶点',
        SnapMid:     '允许捕捉中点',
        SnapCross:   '允许捕捉交点',
        SnapGlider:  '允许捕捉线上点',

        Loading:       '正在加载...',
        Cmd_:          '选择',
        CmdPoint:      '点',
        CmdSegment:    '线段',
        CmdRay:        '射线',
        CmdLine:       '直线',
        CmdTriangle:   '三角形',
        CmdQuadrangle: '四边形',
        CmdCircle2p:   '圆心圆',
        CmdCircle3p:   '三点圆'
      })
      .preferredLanguage(lang && lang.toLowerCase().indexOf('cn') >= 0 ? 'cn' : 'en')
      .useSanitizeValueStrategy(null);
  }]);
