/**
 * EventController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  

  /**
   * `EventController.apiHealthChecks()`
   */
  apiHealthChecks: async function (req, res) {
    return res.json({
      todo: 'apiHealthChecks() is not implemented yet!'
    });
  }

};

