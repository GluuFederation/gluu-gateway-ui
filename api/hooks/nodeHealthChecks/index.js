/**
 * nodeHealthChecks hook
 *
 * @description :: A hook definition.  Extends Sails by adding shadow routes, implicit actions, and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */
var HealthCheckEvents = require("../../events/node-health-checks")
var cron = require('node-cron');
module.exports = function defineNodeHealthChecksHook(sails) {

  return {

    /**
     * Private hook method to subscribe to health check events
     *
     * @param {Function}  next  Callback function to call after all is done
     */
    process: function process() {

      sails.log(new Date(), "Hook:node_health_checks:process() called")

      // Start health checks for all eligible nodes
      sails.models.kongnode.find({})
          .exec(function(err,nodes){
              if(!err && nodes.length){
                  nodes.forEach(function(node){
                      if(node.health_checks) HealthCheckEvents.start(node)
                  })
              }
          })

      HealthCheckEvents.addListener('health_checks.start', function(node){
          //sails.log(new Date(), "Hook:health_checks:on:health_checks.start",node)
          HealthCheckEvents.start(node)

      });


      HealthCheckEvents.addListener('health_checks.stop', function(node){
          //sails.log(new Date(), "Hook:health_checks:on:health_checks.stop",node)
          HealthCheckEvents.stop(node)
      });

  },

    /**
     * Runs when this Sails app loads/lifts.
     */
    initialize: async function() {

      sails.log.info('Initializing custom hook (`nodeHealthChecks`)');
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
