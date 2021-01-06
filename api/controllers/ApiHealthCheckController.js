/**
 * ApiHealthCheckController
 *
 * @description :: Server-side logic for managing apihealthchecks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {

    subscribeHealthChecks: function(req, res) {

        if (!req.isSocket) {
            sails.log.error(new Date(), "ApiHealthCheckController:subscribe failed")
            return res.badRequest('Only a client socket can subscribe.');
        }

        var roomName = 'api.health_checks';
        sails.sockets.join(req.socket, roomName);
        res.json({
            room: roomName
        });
    },

});

