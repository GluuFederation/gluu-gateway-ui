module.exports = {


  friendlyName: 'Send slack notification',


  description: '',


  inputs: {
    settings: {
      description: '',
      type: {},
      defaultsTo: {}
    },
    message: {
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
    var slack = _.find(inputs.settings.data.integrations, function (item) {
      return item.id == 'slack'
    });

    if (!slack || !slack.config.enabled) return;

    // Send notification to slack
    var IncomingWebhook = require('@slack/client').IncomingWebhook;

    var field = _.find(slack.config.fields, function (item) {
      return item.id == 'slack_webhook_url'
    })

    var url = field ? field.value : "";

    var webhook = new IncomingWebhook(url);

    webhook.send(inputs.message, function (err, header, statusCode, body) {
      if (err) {
        sails.log(new Date(), 'Error:', err);
      } else {
        sails.log(new Date(), 'Received', statusCode, 'from Slack');
      }
    });
  }


};

