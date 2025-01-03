const https = require('https');
const fs = require('fs');
const express = require('express');
const app = express();
const axios = require('axios');
const path = require('path');
const sdk = require("./lib/sdk");
const { clear } = require('console');


var Promise = sdk.Promise;




module.exports = {
    botId: "st-ebda08ba-61f8-5eed-894a-9fd516a252cc",
    botName: "RGI NLP Bot",
    on_user_message: async function(requestId, data, callback) {
        console.log("userMessage : ",data.message);
        console.log("user session", JSON.stringify(data.context.session.UserSession));
        console.log(data.context.entities);
        // Object.assign(data.context.session.BotUserSession.entities, data.context.entities);

        return sdk.sendBotMessage(data, callback);
    },

    on_bot_message: async function(requestId, data, callback) {
        console.log("botMessage : ",data.message);
        console.log(data.context.entities);
        // Object.assign(data.context.session.BotUserSession.entities, data.context.entities);

        return sdk.sendUserMessage(data, callback);
    },

    on_webhook: function(requestId, data, callback) {
        //console.log("On event message count: ", ++countTest);
        console.log("on_event -->  Event : ", data.event);
        //console.log("data in webhook <<<", data);

        return sdk.sendUserMessage(data, callback);
    },


    on_event: async function(requestId, data, callback) {
        // Object.assign(data.context.session.BotUserSession.entities, data.context.entities);
         console.log("on_event -->  Event : ", data.event);
     },

    on_alert: function(requestId, data, callback) {
        console.log("on_alert -->  : ", data, data.message);
        return sdk.sendAlertMessage(data, callback);
    }
};
