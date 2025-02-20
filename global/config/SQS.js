// global/config/SQS.js
// It does not have any usage for now.
const AWS = require('aws-sdk');
const sqs = new AWS.SQS();

const sendMessageToQueue = async (fileData) => {
    const params = {
        MessageBody: JSON.stringify(fileData),
        QueueUrl: process.env.FILE_UPLOAD_QUEUE_URL,
    };

    try {
        const result = await sqs.sendMessage(params).promise();
        console.log("Message sent to SQS:", result.MessageId);
        return result;
    } catch (error) {
        console.error("Error sending message to SQS:", error);
        throw error;
    }
};

module.exports = { sendMessageToQueue };
