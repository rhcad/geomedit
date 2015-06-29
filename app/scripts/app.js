/**
 * @ngdoc overview
 * @name geomeditApp
 * @description
 * # geomeditApp
 *
 * Main module of the application.
 */
angular.module('geomeditApp', ['ui.router', 'ngAnimate', 'mgcrea.ngStrap', 'pascalprecht.translate', 'LocalStorageModule'])
  .config(['$stateProvider', '$urlRouterProvider', 'localStorageServiceProvider',
    function($stateProvider, $urlRouterProvider, localStorage) {
      'use strict';

      $stateProvider
        .state('home', {
          url: '/',
          templateUrl: 'views/home.html'
        })
        .state('blog', {
          url: '/blog',
          templateUrl: 'views/home.html'
        })
        .state('sketch', {
          url: '/sketch',
          templateUrl: 'views/sketch.html',
          controller: 'MainCtrl'
        })
        .state('sketch.toolbox', {
          url: '/tool',
          templateUrl: 'views/toolbox.html',
          controller: 'ToolboxCtrl'
        })
        .state('sketch.properties', {
          url: '/prop',
          templateUrl: 'views/properties.html',
          controller: 'PropCtrl'
        });

      $urlRouterProvider.otherwise('/sketch');
      localStorage.setPrefix('geomedit');

      JXG.extend(JXG, { isFalse: function(v) {
        return typeof v === 'boolean' && !v;
      }});

    }]);
