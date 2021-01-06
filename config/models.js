/**
 * Default model settings
 * (sails.config.models)
 *
 * Your default, project-wide model settings. Can also be overridden on a
 * per-model basis by setting a top-level properties in the model definition.
 *
 * For details about all available model settings, see:
 * https://sailsjs.com/config/models
 *
 * For more general background on Sails model settings, and how to configure
 * them on a project-wide or per-model basis, see:
 * https://sailsjs.com/docs/concepts/models-and-orm/model-settings
 */

module.exports.models = {


  /***************************************************************************
     *                                                                          *
     * Your app's default connection. i.e. the name of one of your app's        *
     * connections (see `config/connections.js`)                                *
     *                                                                          *
     ***************************************************************************/
    //connection: process.env.DB_ADAPTER || 'localDiskDb',
    datastore: 'default',// || sails.config.datastores.default,
    migrate: 'alter',

    updateOrCreate: function(criteria, values, cb){
        var self = this; // reference for use by callbacks
        // If no values were specified, use criteria
        if (!values) values = criteria.where ? criteria.where : criteria;

        this.findOne(criteria, function (err, result){
            if(err) return cb(err, false);

            if(result){
                self.update(criteria, values, cb);
            }else{
                self.create(values, cb);
            }
        });
    },

    /**
     * This method adds records to the database
     *
     * To use add a variable 'seedData' in your model and call the
     * method in the bootstrap.js file
     */
    seed: function (callback) {
        try{
        var self = this;
        var modelName = self.adapter.identity.charAt(0).toUpperCase() + self.adapter.identity.slice(1);
        if (!self.seedData) {
            sails.log.debug(new Date(), 'No data avaliable to seed ' + modelName);
            callback();
            return;
        }
        self.count().exec(function (err, count) {
            if (!err && count === 0) {
                sails.log.debug(new Date(), 'Seeding ' + modelName + '...');
                if (self.seedData instanceof Array) {
                    self.seedArray(callback);
                } else {
                    self.seedObject(callback);
                }
            } else {
                sails.log.debug(new Date(), modelName + ' had models, so no seed needed');
                callback();
            }
        });
    } catch(e) {
        //for (var k in self.seedData)

        console.log("entering catch block...seed:"+self.seedData);
        console.log(e);
    console.log("leaving catch block");

    }
    },
    seedArray: function (callback) {
        try{
        var self = this;
        var modelName = self.adapter.identity.charAt(0).toUpperCase() + self.adapter.identity.slice(1);
        self.createEach(self.seedData).exec(function (err, results) {
            if (err) {
                sails.log.debug(new Date(), err);
                callback();
            } else {
                sails.log.debug(new Date(), modelName + ' seed planted');
                callback();
            }
        });
    } catch(e) {
        console.log("entering catch block...seedArray");
  console.log(e);
  console.log("leaving catch block");

    }
    },
    seedObject: function (callback) {
        try{
        var self = this;
        var modelName = self.adapter.identity.charAt(0).toUpperCase() + self.adapter.identity.slice(1);
        self.create(self.seedData).exec(function (err, results) {
            if (err) {
                sails.log.debug(new Date(), err);
                callback();
            } else {
                sails.log.debug(new Date(), modelName + ' seed planted');
                callback();
            }
        });
    } catch(e) {
        console.log("entering catch block...seedObject");
  console.log(e);
  console.log("leaving catch block");

    }
    },
  /***************************************************************************
  *                                                                          *
  * Whether model methods like `.create()` and `.update()` should ignore     *
  * (and refuse to persist) unrecognized data-- i.e. properties other than   *
  * those explicitly defined by attributes in the model definition.          *
  *                                                                          *
  * To ease future maintenance of your code base, it is usually a good idea  *
  * to set this to `true`.                                                   *
  *                                                                          *
  * > Note that `schema: false` is not supported by every database.          *
  * > For example, if you are using a SQL database, then relevant models     *
  * > are always effectively `schema: true`.  And if no `schema` setting is  *
  * > provided whatsoever, the behavior is left up to the database adapter.  *
  * >                                                                        *
  * > For more info, see:                                                    *
  * > https://sailsjs.com/docs/concepts/orm/model-settings#?schema           *
  *                                                                          *
  ***************************************************************************/

   //schema: true,


  /***************************************************************************
  *                                                                          *
  * How and whether Sails will attempt to automatically rebuild the          *
  * tables/collections/etc. in your schema.                                  *
  *                                                                          *
  * > Note that, when running in a production environment, this will be      *
  * > automatically set to `migrate: 'safe'`, no matter what you configure   *
  * > here.  This is a failsafe to prevent Sails from accidentally running   *
  * > auto-migrations on your production database.                           *
  * >                                                                        *
  * > For more info, see:                                                    *
  * > https://sailsjs.com/docs/concepts/orm/model-settings#?migrate          *
  *                                                                          *
  ***************************************************************************/

   //migrate: 'alter',


  /***************************************************************************
  *                                                                          *
  * Base attributes that are included in all of your models by default.      *
  * By convention, this is your primary key attribute (`id`), as well as two *
  * other timestamp attributes for tracking when records were last created   *
  * or updated.                                                              *
  *                                                                          *
  * > For more info, see:                                                    *
  * > https://sailsjs.com/docs/concepts/orm/model-settings#?attributes       *
  *                                                                          *
  ***************************************************************************/

  /*attributes: {
    createdAt: { type: 'number', autoCreatedAt: true, },
    updatedAt: { type: 'number', autoUpdatedAt: true, },
    id: { type: 'number', autoIncrement: true, },
    //--------------------------------------------------------------------------
    //  /\   Using MongoDB?
    //  ||   Replace `id` above with this instead:
    //
    // ```
    // id: { type: 'string', columnName: '_id' },
    // ```
    //
    // Plus, don't forget to configure MongoDB as your default datastore:
    // https://sailsjs.com/docs/tutorials/using-mongo-db
    //--------------------------------------------------------------------------
  },*/


  /******************************************************************************
  *                                                                             *
  * The set of DEKs (data encryption keys) for at-rest encryption.              *
  * i.e. when encrypting/decrypting data for attributes with `encrypt: true`.   *
  *                                                                             *
  * > The `default` DEK is used for all new encryptions, but multiple DEKs      *
  * > can be configured to allow for key rotation.  In production, be sure to   *
  * > manage these keys like you would any other sensitive credential.          *
  *                                                                             *
  * > For more info, see:                                                       *
  * > https://sailsjs.com/docs/concepts/orm/model-settings#?dataEncryptionKeys  *
  *                                                                             *
  ******************************************************************************/

  dataEncryptionKeys: {
    default: 'cjkptmtN0RPK0zRvwRJqp2Ru752GjP238N7YpJ+/JdY='
  },


  /***************************************************************************
  *                                                                          *
  * Whether or not implicit records for associations should be cleaned up    *
  * automatically using the built-in polyfill.  This is especially useful    *
  * during development with sails-disk.                                      *
  *                                                                          *
  * Depending on which databases you're using, you may want to disable this  *
  * polyfill in your production environment.                                 *
  *                                                                          *
  * (For production configuration, see `config/env/production.js`.)          *
  *                                                                          *
  ***************************************************************************/

  cascadeOnDestroy: true


};
