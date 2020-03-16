import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";

admin.initializeApp();

const fcm = admin.messaging();

/**
 * An enum for the possible severities of an Exposure.
 * These details haven't been ironed out as of 3/16/20.
 */
enum Severity {
    SUSPECTED,
    TESTED_POSITIVE
}

/**
 * A class to represent a document in the exposures collection.
 */
class Exposure {
    /**
     * The time at which the document was created.
     */
    created_at: Date;

    /**
     * The time at which the exposed party intersected with the infected individual.
     */
    intersected_at: Date;

    /**
     * The device fingerprint representing the location at which the parties intersected.
     */
    intersection_device_fp: string;

    /**
     * True if the exposure has been retracted (such as if it was sent in error). False otherwise.
     */
    retracted: boolean;

    /**
     * The severity of the exposure. See Severity.
     */
    severity: Severity;

    /**
     * Builds a new Exposure from a document snapshot.
     * @param snapshot The snapshot from which to build the new Exposure.
     */
    constructor(snapshot: DocumentSnapshot) {
        this.created_at = snapshot.get('created_at');
        this.intersected_at = snapshot.get('intersected_at');
        this.intersection_device_fp = snapshot.get('intersection_device_fp');
        this.retracted = snapshot.get('retracted');
        this.severity = snapshot.get('severity')
    }
}

/**
 * Sends a message to all who have subscribed to the exposure location's FP topic
 * when a new Exposure is added to the exposure collection.
 */
export const messageOnNewExposure = functions.firestore
    .document('exposures/{exposureId}')
    .onCreate(async snapshot => {
        const exposure = new Exposure(snapshot);
        const time = getPrettyTime(exposure.intersected_at);

        return sendToTopic(
            'New CoV-SARS-2 Exposure on ' + time,
            'Don\'t panic! We\'re here to help. Tap here.',
            exposure.intersection_device_fp
        )
    });

/**
 * Sends a message to all who have subscribed to the exposure location's FP topic
 * when an Exposure has been retracted (such as if it were sent in err).
 */
export const messageOnRetractedExposure = functions.firestore
    .document('exposures/{exposureId}')
    .onUpdate((change) => {
        const newExposure = new Exposure(change.after);
        const time = getPrettyTime(newExposure.intersected_at);

        if (newExposure.retracted) {
            return sendToTopic(
                'Retracted CoV-SARS-2 Exposure on ' + time,
                'Still think you\'re sick? Tap here.',
                newExposure.intersection_device_fp
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
    return month + " " + day + " " + year;
}

/**
 * Sends a message on the specified topic.
 * @param title The title for the new message.
 * @param body The body for the new message.
 * @param topic The topic on which to send the message. This will usually be the location FP
 *              for the location of exposure, but could also be something like "general" to
 *              send a message to all users of the app.
 */
function sendToTopic(title: string, body: string, topic: string) {
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