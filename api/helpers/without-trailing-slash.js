module.exports = {


  friendlyName: 'Without trailing slash',


  description: '',


  inputs: {
    stringInput: {
      description: '',
      type: 'string',
      defaultsTo: ''
    },

  },


  exits: {

    success: {
      description: 'All done.',
    },

  },


  fn: async function (inputs) {
    if (!inputs.stringInput) return exits.success(inputs.stringInput);
    return exits.success(inputs.stringInput.replace(/\/$/, ""));
  }


};

