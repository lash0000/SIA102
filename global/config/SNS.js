// global/config/SNS.js

const AWS = require('aws-sdk');

// Initialize SNS client
const sns = new AWS.SNS({
  region: 'ap-southeast-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

/**
 * Send SMS via AWS SNS to a phone number.
 * Only works if the number is verified in sandbox mode.
 */
const sendSMS = async ({ phoneNumber, message }) => {
  try {
    const params = {
      Message: message,
      PhoneNumber: phoneNumber,
    };

    const result = await sns.publish(params).promise();
    console.log(`SNS SMS sent. Message ID: ${result.MessageId}`);
    return { success: true, messageId: result.MessageId };
  } catch (err) {
    console.error('SNS SMS Error:', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { sendSMS };
