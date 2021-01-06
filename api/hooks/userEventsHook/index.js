/**
 * userEventsHook hook
 *
 * @description :: A hook definition.  Extends Sails by adding shadow routes, implicit actions, and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */

var userEvents = require("../../events/user-events")

module.exports = function defineUserEventsHookHook(sails) {

  return {
    /**
     * Private hook method to subscribe to health check events
     *
     * @param {Function}  next  Callback function to call after all is done
     */
    process: function process() {

      sails.log(new Date(), "Hook:user_events_hook:process() called")


      userEvents.addListener('user.signUp', function(data){
          sails.log(new Date(), "Hook:user_events_hook:on:user.signUp",data)

          var user = data.user;
          var sendActivationEmail = data.sendActivationEmail;
          if(sendActivationEmail) {
              userEvents.notify(user)
          }

      });

  },
    /**
     * Runs when this Sails app loads/lifts.
     */
    initialize: async function() {

      sails.log.info('Initializing custom hook (`userEventsHook`)');
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
