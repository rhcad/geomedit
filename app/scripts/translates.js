'use strict';

angular.module('geomeditApp')
  .config(['$translateProvider', function($translateProvider) {

    $translateProvider
      .translations('en', {
        Languages:   'UI Language',
        SnapOptions: 'Snapping Options',
        SnapVertex:  'Snap to vertex',
        SnapMid:     'Snap to midpoint',
        SnapCenter:  'Snap to center',
        SnapCross:   'Snap to intersection',
        SnapGlider:  'Snap to edge',

        Loading:    'Loading...',
        CmdLine:    'Segment',
        CmdCircle3: 'Circle through three points'
      })
      .translations('cn', {
        Languages:   '界面语言',
        SnapOptions: '捕捉选项',
        SnapVertex:  '允许捕捉顶点',
        SnapMid:     '允许捕捉中点',
        SnapCenter:  '允许捕捉圆心',
        SnapCross:   '允许捕捉交点',
        SnapGlider:  '允许捕捉线上点',

        Loading:    '正在加载...',
        CmdLine:    '线段',
        CmdCircle3: '过三点画圆'
      })
      .preferredLanguage('cn')
      .useSanitizeValueStrategy(null);
  }]);
