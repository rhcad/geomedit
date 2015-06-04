'use strict';

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

    $stateProvider
      .state('toolbox', {
        templateUrl: 'views/toolbox.html'
      })
      .state('properties', {
        templateUrl: 'views/properties.html'
      });

    localStorage.setPrefix('geomedit');

  }]);
