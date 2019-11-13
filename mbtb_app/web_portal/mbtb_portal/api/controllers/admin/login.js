const request = require('request');

module.exports = {

  friendlyName: 'Welcome Admin',

  description: 'Look up the specified admin and welcome them',

  inputs: {
    admin_email: {
      description: 'The email to try in this attempt, e.g. "irl@example.com".',
      type: 'string',
      required: true
    },

    admin_password: {
      description: 'The unencrypted password to try in this attempt, e.g. "passwordlol".',
      type: 'string',
      required: true
    }
  },
  exits: {
    bad_combo: {
      responseType: 'view',
      viewTemplatePath: 'pages/admin_login',
      description: 'return view for password mismatch, display error msg'
    }
  },


  fn: function (inputs, exits) {
    var req = this.req;
    var res = this.res;

    let credentials = {
      email: inputs.admin_email,
      password: inputs.admin_password,
    };

    let url = sails.config.custom.user_api_url + 'admin_auth';

    // post request for retrieving auth token from api, with credentials as payload
    request.post({url: url, formData: credentials},
      function optionalCallback(err, httpResponse, body) {
        if (err && httpResponse.statusCode !== 200) {
          return exits.bad_combo({'error_msg': err}) // display error msg if something goes wrong with request
        }
        else {
          try {
            const response = JSON.parse(body);
            if(typeof (response) == "object"){
              return exits.bad_combo({'error_msg': response.Error}) // display error msg for wrong email, password
            }
          }
          catch (e) {
            // set session variables: admin_user to true and save auth token for further usage
            // redirect to admin homepage
            req.session.admin_user = true;
            req.session.admin_auth_token_val = body;
            return res.redirect('/admin');
          }
        }
      });
  }
};
