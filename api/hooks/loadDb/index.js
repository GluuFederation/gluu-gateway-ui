/**
 * loadDb hook
 *
 * @description :: A hook definition.  Extends Sails by adding shadow routes, implicit actions, and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */
var async = require('async');
module.exports = function defineLoadDbHook(sails) {

  return {

        /**
     * Private hook method to do actual database data population. Note that fixture data are only loaded if there
     * isn't any users in current database.
     *
     * @param {Function}  next  Callback function to call after all is done
     */
    process: function process(next) {
      sails.log.info(new Date(), "Hook:load_db:process() called")
      if (sails.config.environment != 'test') {
        var seedPassports = function (cb) {
          sails.models.user
            .find()
            .exec(function callback(error, users) {
              if (error) return cb(error)

              var passportsFns = []
              users.forEach(function (user) {
                passportsFns.push(function (_cb) {
                  sails.models.passport
                    .create({
                      protocol: "local",
                      password: user.username == 'admin' ? 'adminadminadmin' : 'demodemodemo',
                      user: user.id
                    }).exec(function (err, passport) {
                    if (err) return _cb(err)
                    return _cb(null)
                  })
                })
              });

              async.series(passportsFns, cb)
            })
        }


        /*async.series([
          // sails.models.user.seed,
          // seedPassports,
          sails.models.kongnode.seed,
          sails.models.emailtransport.seed,
          function seedOrMergeSettings(cb) {
            var seeds = sails.models.settings.seedData[0]
            sails.models.settings.find().limit(1)
              .exec(function (err, data) {
                if (err) return cb(err)
                var _data = _.merge(seeds, data[0] || {})
                sails.models.settings.updateOrCreate({
                  id: _data.id
                }, _data, function (err, coa) {
                  if (err) return cb(err)
                  return cb()
                })
              })
          }
        ], next);*/
        next();
      }
    },


    /**
     * Runs when this Sails app loads/lifts.
     */
    initialize: async function(next) {

      sails.log.info('Initializing custom hook (`loadDb`)');
      return new Promise((resolve)=>{
        sails.after('hook:orm:loaded', ()=>{
          // Finish initializing custom hook
          this.process(next);
          resolve();
        });
      });

    }

  };

};
