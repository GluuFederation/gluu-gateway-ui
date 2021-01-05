module.exports = {


  friendlyName: 'Get minutes diff',


  description: 'Get minutes diff',


  inputs: {

    startDate: {
      type: 'ref',
      example: new Date(),
      description: 'Start date.',
      required: true
    },
    endDate: {
      type: 'ref',
      example: new Date(),
      description: 'End date.',
      required: true
    }

  },


  exits: {

    success: {
      outputFriendlyName: 'Minutes diff',
    },

  },


  fn: async function (inputs, exits) {

    // Get minutes diff.

    var minutesDiff = moment.duration(moment(inputs.startDate).diff(moment(inputs.endDate)));

    // Send back the result through the success exit.
    return exits.success(minutesDiff.asMinutes());

  }


};

