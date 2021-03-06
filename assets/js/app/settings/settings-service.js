/**
 * This file contains all necessary Angular controller definitions for 'frontend.admin.login-history' module.
 *
 * Note that this file should only contain controllers and nothing else.
 */
(function () {
  'use strict';

  angular.module('frontend.settings')
    .service('SettingsService', [
      '$localStorage', '$http',
      function ($localStorage, $http) {

        var defSettings = {
          kong_version: "1.5.x"
        };

        var kong_versions = [
          {'name': "1.5.x", value: "1.5.x"}
        ];

        return {
          getKongVersions: function () {
            return kong_versions
          },
          setSettings: function (settings) {
            console.log("########", settings)
            $localStorage.settings = settings
          },
          getSettings: function () {
            return $localStorage.settings || defSettings
          }
        }
      }
    ]);
}());
