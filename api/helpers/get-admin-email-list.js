module.exports = {


  friendlyName: 'Get admin email list',


  description: '',


  inputs: {
    cb: {
      type: 'ref',
      description: 'The current incoming request (req).',
      required: true
    }

  },


  exits: {

    success: {
      outputFriendlyName: 'Admin email list',
    },

  },


  fn: async function (inputs) {

    sails.models.user.find({
      admin: true
    }).exec(function (err, admins) {
      if (err) return exits.success(inputs.cb(err));
      if (!admins.length) return exits.success(inputs.cb([]));
      return exits.success(inputs.cb(null, admins.map(function (item) {
        return item.email;
      })));
    });

  }


};

