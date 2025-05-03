const mongoose = require('mongoose');
const AWS = require('aws-sdk');
const { Connection } = require('../../guest_notify/model');

// Centralized function to send messages to a WebSocket client
const sendMessageToClient = async (domainName, stage, connectionId, message) => {
    try {
        const apiGateway = new AWS.ApiGatewayManagementApi({
            apiVersion: '2018-11-29',
            endpoint: `${domainName}/${stage}`
        });

        await apiGateway.postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify(message)
        }).promise();
    } catch (error) {
        if (error.statusCode === 410) {
            // Stale connection, remove it
            await Connection.deleteOne({ connectionId });
        } else {
            console.error('Error sending message:', error);
        }
    }
};

module.exports = { sendMessageToClient };