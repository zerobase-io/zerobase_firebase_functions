import * as functions from "firebase-functions";
import {Exposure} from "./models/exposure";
import * as admin from "firebase-admin";

/**
 * Sends a message to all who have subscribed to the exposure location's FP topic
 * when a new Exposure is added to the exposure collection.
 */
export const _messageOnNewExposure = (fcm: admin.messaging.Messaging) => functions.firestore
    .document('exposures/{exposureId}')
    .onCreate(async snapshot => {
        console.log("_messageOnNewExposure", snapshot);
        const exposure = Exposure.fromSnapshot(snapshot);
        const time = getPrettyTime(exposure.intersected_at);

        return sendToTopic(
            'New CoV-SARS-2 Exposure on ' + time,
            'Don\'t panic! We\'re here to help.',
            exposure.intersection_device_fp,
            fcm
        )
    });

/**
 * Sends a message to all who have subscribed to the exposure location's FP topic
 * when an Exposure has been retracted (such as if it were sent in err).
 */
export const _messageOnRetractedExposure = (fcm: admin.messaging.Messaging) => functions.firestore
    .document('exposures/{exposureId}')
    .onUpdate((change) => {
        console.log("_messageOnRetractedExposure", change);

        const newExposure = Exposure.fromSnapshot(change.after);
        const time = getPrettyTime(newExposure.intersected_at);

        if (newExposure.retracted) {
            return sendToTopic(
                'Retracted CoV-SARS-2 Exposure on ' + time,
                'Still think you\'re sick? We\'ve got you covered.',
                newExposure.intersection_device_fp,
                fcm
            )
        } else {
            return
        }
    });

/**
 * Formats a Date in to be short and human-readable.
 * @param date The date to format.
 */
function getPrettyTime(date: Date) {
    const dateTimeFormat = new Intl.DateTimeFormat('en', {year: 'numeric', month: 'short', day: '2-digit'});
    const [{value: month}, {value: day}, {value: year}] = dateTimeFormat.formatToParts(date);
    // TODO [ndrwksr | 3/16/20]: This isn't coming out right, haven't looked into it but someone with more
    //  JS experience can probably point out how this should be done.
    return month + " " + day + " " + year;
}

/**
 * Sends a message on the specified topic.
 * @param title The title for the new message.
 * @param body The body for the new message.
 * @param topic The topic on which to send the message. This will usually be the location FP
 *              for the location of exposure, but could also be something like "general" to
 *              send a message to all users of the app.
 * @param fcm The Messaging instance to send the messages with.
 */
function sendToTopic(title: string, body: string, topic: string, fcm: admin.messaging.Messaging) {
    console.log("sendToTopic", title, body, topic);
    const payload: admin.messaging.MessagingPayload = {
        notification: {
            title: title,
            body: body,
            icon: 'https://zerobase.io/dist/img/zerobase_medium_logo.png',
            click_action: 'FLUTTER_NOTIFICATION_CLICK' // required only for onResume or onLaunch callbacks
        },
        // TODO [ndrwksr | 3/16/20]: Implement adding payloads so that the app can determine
        //  how to appropriately react to the message.
        // data: {
        //
        // }
    };

    return fcm.sendToTopic(topic, payload);
}