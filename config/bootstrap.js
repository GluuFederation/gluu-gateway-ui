/**
 * Seed Function
 * (sails.config.bootstrap)
 *
 * A function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also create a hook.
 *
 * For more information on seeding your app with fake data, check out:
 * https://sailsjs.com/config/bootstrap
 */
'use strict';

var fs = require('fs')

module.exports.bootstrap = async function(next) {

  // By convention, this is a good place to set up fake data during development.
  //
  // For example:
  // ```
  // // Set up fake development data (or if we already have some, avast)
  // if (await User.count() > 0) {
  //   return;
  // }
  //
  // await User.createEach([
  //   { emailAddress: 'ry@example.com', fullName: 'Ryan Dahl', },
  //   { emailAddress: 'rachael@example.com', fullName: 'Rachael Shaw', },
  //   // etc.
  // ]);
  // ```

  sails.services.passport.loadStrategies();


  // Create Konga data directories
  var dirs = [( process.env.STORAGE_PATH || './kongadata/' ), ( process.env.STORAGE_PATH || './kongadata/' )+ 'uploads']


  dirs.forEach(function(dir){
      if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
      }
  })

  next();
};
