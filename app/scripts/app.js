/**
 * @ngdoc overview
 * @name geomeditApp
 * @description
 * # geomeditApp
 *
 * Main module of the application.
 */
angular.module('geomeditApp', ['ui.router', 'ngAnimate', 'mgcrea.ngStrap', 'pascalprecht.translate', 'LocalStorageModule'])
  .config(['$stateProvider', 'localStorageServiceProvider', function($stateProvider, localStorage) {
    'use strict';

    $stateProvider
      .state('toolbox', {
        templateUrl: 'views/toolbox.html',
        controller: 'ToolboxCtrl'
      })
      .state('properties', {
        templateUrl: 'views/properties.html',
        controller: 'PropCtrl'
      });

    localStorage.setPrefix('geomedit');

    JXG.extend(JXG, { isFalse: function(v) {
      return typeof v === 'boolean' && !v;
    }});

  }]);
