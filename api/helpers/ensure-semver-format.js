module.exports = {


  friendlyName: 'Ensure semver format',


  description: '',


  inputs: {
    version: {
      description: 'version',
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
    if (inputs.version.indexOf("-") < 0) {
      // Find the index of the first alphanumeric character in the version string
      let firstAlphaIndex = inputs.version.search(/[a-zA-Z]/);
      if (firstAlphaIndex > -1) {
        // Remove everything from that character onward
        return exits.success(inputs.version.substring(0, firstAlphaIndex));
      }
    }

    return exits.success(version);
  }


};

