import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import * as express from 'express';
import {acceptNewMessageRequest} from "./messaging";
import {MessagingRequest} from "./models/messagingRequest";
import {Twilio} from "twilio"

// Must be called to use admin SDK functions
admin.initializeApp(functions.config().firebase);

// Initialize FCM client
const fcm = admin.messaging();

// Initialize Twilio client
const twilioSid = functions.config()["twilio"]["sid"];
const twilioToken = functions.config()["twilio"]["token"];
const twilio: Twilio = require('twilio')(twilioSid, twilioToken);

// Initialize Mailgun client
const nodemailer = require('nodemailer');
const mailgun = require('nodemailer-mailgun-transport');
const mailgunAuth = {
    auth: {
        api_key: functions.config()["mailgun"]["api_key"],
        domain: functions.config()["mailgun"]["domain"],
    }
};
const nodemailerMailgun = nodemailer.createTransport(mailgun(mailgunAuth));

// Embed the "from" configuration in the the mailer object
// This might not be the best way to do this, but this is configuration for the mailer and does not
// change, so this was a convenient way to provide it. It's retrieved in sendEmail.
nodemailerMailgun.__from = {
    name: functions.config()["mailgun"]["from_title"],
    address: functions.config()["mailgun"]["from_email"]
};

// Setup up route for POST /messaging
const app = express();

// TODO [ndrwksr | 3/21/20]: See https://github.com/zerobase-io/zerobase_firebase_functions/issues/3
//  - Move this to the appropriate place
app.post('/messaging', async (req, res) => {
    const request = MessagingRequest.fromReqBody(req.body);
    const notificationSystemApiToken = functions.config()["zerobase"]["token"];
    if (request.token !== notificationSystemApiToken) {
        res.status(401).send({error: "Invalid token!"})
    } else {
        acceptNewMessageRequest(fcm, twilio, nodemailerMailgun)(request)
            .then(messagingResponse => {
                // Redact API token from response
                messagingResponse.token = undefined;
                return messagingResponse
            })
            .then(messagingResponse => {
                res.status(200).send(messagingResponse)
            })
            .catch(e => res.status(500).send({
                error: e
            }))
    }
});

// noinspection JSUnusedGlobalSymbols -- Used by firebase (ndrwksr | 3/16/20)
export const webApi = functions.https.onRequest(app);