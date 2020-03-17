import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import * as express from 'express';
import {_messageOnNewExposure, _messageOnRetractedExposure} from "./firebase_funcs";
import {Exposure} from './models/exposure';

const Joi = require('@hapi/joi');
const cors = require('cors');

admin.initializeApp(functions.config().firebase);

const fcm = admin.messaging();

const app = express();
// https://itnext.io/building-a-serverless-restful-api-with-cloud-functions-firestore-and-express-f917a305d4e6
const main = express(); // I can't explain why, but we can't use app in place of main. I tried.

main.use('/api/v1', app);
main.use(cors());

/**
 * Creates a new Exposure in the /exposures collection.
 * messageOnNewExposure is invoked via the platform, so we don't need to call it at the end.
 *
 * Sample Request:
   HOST: https://us-central1-zerobase-notifications.cloudfunctions.net/webApi/exposures
   {
	"intersected_at":"2020-12-18T16:39:57-08:00",
	"intersection_device_fp":"topic",
	"retracted":false,
	"severity":"TESTED_POSITIVE"
   }

 * Sample Response:
   STATUS: 201
   {
    "_id": "bk3Ezydl48KksL32KiX2",
    "intersected_at": "2020-12-19T00:39:57.000Z",
    "intersection_device_fp": "topic",
    "retracted": false,
    "severity": "TESTED_POSITIVE"
   }

 * Planned Error Responses:
   STATUS: 422
   {
    "message": "[Human-Readable Message]"
    "error": "[Insert Error Here]"
   }
 */
// TODO [ndrwksr | 3/16/20]: This is the wrong place to put this, but the question "where should I put this" isn't
//  one I can answer. If you know better how to structure this, please feel free to fix it.
main.post('/exposures', async (req, res) => {
    const validated = Joi.validate(req.body, Exposure.schema);
    if (validated.error) {
        // Failed validation
        res.status(422).send({
            message: 'Invalid Request',
            data: req.body,
            error: validated.error
        });
    } else {
        // TODO [ndrwksr | 3/16/20]: Converting req.body into an Exposure, then extracting the data like this is
        //  redundant but it doesn't work if 'exposure.data()' is replaced with 'req.body'.
        //  This is almost certainly an easy fix, I'm just not experienced enough with JS to figure these ones out
        const exposure = Exposure.fromReqBody(req.body);
        admin.firestore().collection('exposures').add(exposure.data())
            .then(ref => {
                console.log("Created new Exposure. ID: " +  ref.id);
                res.status(201).send({
                    _id: ref.id,
                    ...validated.value
                })
            })
            .catch(e => {
                console.log(e);
                res.status(500).send({
                    message: 'Could Not Save New Exposure',
                    data: req.body,
                    error: e
                });
            })
    }
});

// noinspection JSUnusedGlobalSymbols -- Used by firebase (ndrwksr)
export const webApi = functions.https.onRequest(main);

// noinspection JSUnusedGlobalSymbols -- Used by firebase (ndrwksr)
export const messageOnNewExposure = _messageOnNewExposure(fcm);

// noinspection JSUnusedGlobalSymbols -- Used by firebase (ndrwksr)
export const messageOnRetractedExposure = _messageOnRetractedExposure(fcm);