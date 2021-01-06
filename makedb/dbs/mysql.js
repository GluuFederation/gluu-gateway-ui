/**
 * Created by user on 06/10/2017.
 */

'use strict'

var mysql = require("../../node_modules/sails-mysql/node_modules/mysql");

module.exports = {
    run : function (next) {
        console.log("Using MySQL DB Adapter.");
        return this.create(next);
    },


    create : function(next) {

        var connection = mysql.createConnection({
            host     : sails.config.datastores.default.host,
            port     : sails.config.datastores.default.port,
            user     : sails.config.datastores.default.user,
            password : sails.config.datastores.default.password

        });

        console.log("Creating database `" + sails.config.datastores.default.database + "` if not exists.");

        connection.query('CREATE DATABASE IF NOT EXISTS ' + sails.config.datastores.default.database, function (error, results, fields) {
            if (error) {
                console.error(error);
                return next(error);
            }

            return next();
        });
    }
}
