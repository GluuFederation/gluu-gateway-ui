/**
 * Created by user on 06/10/2017.
 */

'use strict'

var pg = require("../../node_modules/sails-postgresql/node_modules/pg");
//var _ = require("lodash");

module.exports = {
    run : function (next) {

        console.log("Using postgres DB Adapter.");

        var self     = this;
        var user     = sails.config.datastores.default.user//dbConf.connections.postgres.user;
        var password = sails.config.datastores.default.password;
        var dbName   = sails.config.datastores.default.database;
        var dbHost   = sails.config.datastores.default.host;
        var dbPort   = sails.config.datastores.default.port;
        var ssl      = sails.config.datastores.default.ssl;

        var opts = {
            user: user,
            host: dbHost,
            database: dbName,
            password: password,
            port: dbPort,
        }

        // console.log("Connection Options =>", opts);

        pg.connect(opts, function (err, client, done) {
            if (err) {

                if(err.code == "3D000")
                {
                    console.log(dbName + " does not exist. Creating...");
                    done();
                    return self.create(opts,next);

                }else{
                    console.error("Failed to connect to DB named `" + dbName + "`",err);
                    return next(err);
                }
            }else{
                console.log("`" + dbName + "` database exists. Continue...");
                return next();
            }

        });
    },


    create : function(opts,next) {

        // Hook up to postgres db so we can create a new one
        var defaultDbOpts = _.merge(_.cloneDeep(opts),{
            database : "postgres"
        });

        pg.connect(defaultDbOpts, function (err, client, done) {
            if (err) {
                console.log(err);
                done();
                return next(err);
            }

            client.query('CREATE DATABASE ' + opts.database, function (err, res) {
                if (err) {
                    console.log("Failed to create `" + opts.database +"`",err);
                    done();
                    return next(err);

                }

                console.log("Database `" + opts.database + "` created! Continue...");

                return next();

            });
        });
    }
}
