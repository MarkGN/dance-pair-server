require("dotenv").config();
const axios = require('axios');

const sendinblueConfig = {
  headers: {
    'content-type': 'application/json',
    'api-key': process.env.SEND_IN_BLUE_KEY,
    'accept': 'application/json'
  }
};

async function sendEmail(senderEmail, senderName, recipient, body, subject) {
  const data = {
    "sender": {
      "name": senderName,
      "email": senderEmail
    },
    "to": [
      {
        "email": recipient,
        "name": null // recipient name?
      }
    ],
    "subject": subject,
    "htmlContent": body
  };
  axios.post('https://api.sendinblue.com/v3/smtp/email', data, sendinblueConfig)
  .then((response) => {
    return response.data;
  })
  .catch((error) => {
    return error.response.data;
  });
}

exports.sendEmail = sendEmail;