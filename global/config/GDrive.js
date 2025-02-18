const { google } = require("googleapis");
const dotenv = require("dotenv");

dotenv.config();

const jwtClient = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    null,
    process.env.PRIVATE_KEY,
    [process.env.PKEY_SCOPES, process.env.PKEY_SCOPES_1]
);

jwtClient.authorize(function (err, tokens) {
    if (err) {
        console.log(err.message)
    } else {
        console.log("Google Autorization Complete");
    }
});

module.exports = jwtClient;