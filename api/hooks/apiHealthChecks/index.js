/**
 * apiHealthChecks hook
 *
 * @description :: A hook definition.  Extends Sails by adding shadow routes, implicit actions, and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */
var HealthCheckEvents = require("../../events/api-health-checks");

module.exports = function (sails) {

  return {

    process: function process() {
      sails.log.info(new Date(), "Hook:api_health_checks:process() called")

      // Start health checks for all eligible nodes
      sails.models.apihealthcheck.find({
          active : true
      })
          .exec(function(err,hcs){
              if(!err && hcs.length){
                  hcs.forEach(function(hc){
                      HealthCheckEvents.start(hc)
                  })
              }
          })

      HealthCheckEvents.addListener('api.health_checks.start', function(hc){
          sails.log.info(new Date(), "Hook:api_health_checks:on:api.health_checks.start",hc)
          HealthCheckEvents.start(hc)

      });


      HealthCheckEvents.addListener('api.health_checks.stop', function(hc){
          sails.log.info(new Date(), "Hook:api_health_checks:on:api.health_checks.stop",hc)
          HealthCheckEvents.stop(hc)
      });
  },
    /**
     * Runs when this Sails app loads/lifts.
     */
    initialize: async function() {

      sails.log.info('Initializing custom hook (`apiHealthChecks`)');
      return new Promise((resolve)=>{
        sails.after('hook:orm:loaded', ()=>{
          // Finish initializing custom hook
          this.process();
          resolve();
        });
      });
    }

  };

};
