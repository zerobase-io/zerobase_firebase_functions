import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import * as express from 'express';

const cors = require('cors');

admin.initializeApp(functions.config().firebase);

const app = express();
// https://itnext.io/building-a-serverless-restful-api-with-cloud-functions-firestore-and-express-f917a305d4e6
const main = express(); // I can't explain why, but we can't use app in place of main. I tried.

main.use('/api/v1', app);
main.use(cors());

// TODO [ndrwksr | 3/16/20]: See https://github.com/zerobase-io/zerobase_firebase_functions/issues/3
//  - This is the wrong place to put this, but the question "where should I put this" isn't
//    one I can answer. If you know better how to structure this, please feel free to fix it.
main.post('/messages', async (req, res) => {
    // TODO [ndrwksr | 3/18/20]: See https://github.com/zerobase-io/zerobase_firebase_functions/pull/9
    //  - Impl according to updated README.md from above pull request
});

// noinspection JSUnusedGlobalSymbols -- Used by firebase (ndrwksr | 3/16/20)
export const webApi = functions.https.onRequest(main);