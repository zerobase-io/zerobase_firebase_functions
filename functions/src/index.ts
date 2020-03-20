import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import * as express from 'express';
import {acceptNewMessageRequest} from "./messaging";
import {MessagingRequest} from "./models/messagingRequest";
import {Twilio} from "twilio"

//const cors = require('cors');

admin.initializeApp(functions.config().firebase);

const app = express();
// https://itnext.io/building-a-serverless-restful-api-with-cloud-functions-firestore-and-express-f917a305d4e6
const main = express(); // I can't explain why, but we can't use app in place of main. I tried.

const fcm = admin.messaging();

main.use('/api/v1', app);
//main.use(cors());

const twilioSid = functions.config()["twilio"]["sid"];
const twilioToken = functions.config()["twilio"]["token"];
const twilio: Twilio = require('twilio')(twilioSid, twilioToken);

// TODO [ndrwksr | 3/16/20]: See https://github.com/zerobase-io/zerobase_firebase_functions/issues/3
//  - This is the wrong place to put this, but the question "where should I put this" isn't
//    one I can answer. If you know better how to structure this, please feel free to fix it.
main.post('/messaging', async (req, res) => {
    let request = MessagingRequest.fromReqBody(req.body);
    acceptNewMessageRequest(fcm, twilio)(request)
        .then(response => res.status(201).send(response))
        .catch(e => res.status(500).send({
            error: e
        }))
});

// noinspection JSUnusedGlobalSymbols -- Used by firebase (ndrwksr | 3/16/20)
export const webApi = functions.https.onRequest(main);