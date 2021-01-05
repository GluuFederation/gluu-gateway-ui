/**
 * Blueprint API Configuration
 * (sails.config.blueprints)
 *
 * For background on the blueprint API in Sails, check out:
 * https://sailsjs.com/docs/reference/blueprint-api
 *
 * For details and more available options, see:
 * https://sailsjs.com/config/blueprints
 */

module.exports.blueprints = {

  /***************************************************************************
  *                                                                          *
  * Automatically expose implicit routes for every action in your app?       *
  *                                                                          *
  ***************************************************************************/

   actions: true,


  /***************************************************************************
  *                                                                          *
  * Automatically expose RESTful routes for your models?                     *
  *                                                                          *
  ***************************************************************************/

   rest: true,


  /***************************************************************************
  *                                                                          *
  * Automatically expose CRUD "shortcut" routes to GET requests?             *
  * (These are enabled by default in development only.)                      *
  *                                                                          *
  ***************************************************************************/

   shortcuts: false,


  /***************************************************************************
   *                                                                          *
   * An optional mount path for all blueprint routes on a controller,         *
   * including `rest`, `actions`, and `shortcuts`. This allows you to take    *
   * advantage of blueprint routing, even if you need to namespace your API   *
   * methods.                                                                 *
   *                                                                          *
   * (NOTE: This only applies to blueprint autoroutes, not manual routes from *
   * `sails.config.routes`)                                                   *
   *                                                                          *
   ***************************************************************************/
  prefix: '/api',

  /***************************************************************************
   *                                                                          *
   * Whether to pluralize controller names in blueprint routes.               *
   *                                                                          *
   * (NOTE: This only applies to blueprint autoroutes, not manual routes from *
   * `sails.config.routes`)                                                   *
   *                                                                          *
   * For example, REST blueprints for `FooController` with `pluralize`        *
   * enabled:                                                                 *
   * GET /foos/:id?                                                           *
   * POST /foos                                                               *
   * PUT /foos/:id?                                                           *
   * DELETE /foos/:id?                                                        *
   *                                                                          *
   ***************************************************************************/
  pluralize: false,

  /***************************************************************************
   *                                                                          *
   * Whether the blueprint controllers should populate model fetches with     *
   * data from other models which are linked by associations                  *
   *                                                                          *
   * If you have a lot of data in one-to-many associations, leaving this on   *
   * may result in very heavy api calls                                       *
   *                                                                          *
   ***************************************************************************/
  //populate: false,

  /****************************************************************************
   *                                                                           *
   * Whether to run Model.watch() in the find and findOne blueprint actions.   *
   * Can be overridden on a per-model basis.                                   *
   *                                                                           *
   ****************************************************************************/
  autoWatch: true,

  /**
   * We want to mirror all socket events also to request maker itself, this simplifies some frontend side data
   * handling logic.
   */
  mirror: true,

  /****************************************************************************
   *                                                                           *
   * The default number of records to show in the response from a "find"       *
   * action. Doubles as the default size of populated arrays if populate is    *
   * true.                                                                     *
   *                                                                           *
   ****************************************************************************/
 // defaultLimit: 4294967295 
};
