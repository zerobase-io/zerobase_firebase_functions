import * as admin from "firebase-admin";

/**
 * Formats a Date in to be short and human-readable.
 * @param date The date to format.
 */
function getPrettyTime(date: Date) {
    const dateTimeFormat = new Intl.DateTimeFormat('en', {year: 'numeric', month: 'short', day: '2-digit'});
    const [{value: month}, {value: day}, {value: year}] = dateTimeFormat.formatToParts(date);
    // TODO [ndrwksr | 3/16/20]: See https://github.com/zerobase-io/zerobase_firebase_functions/issues/1
    //  - This isn't coming out right, haven't looked into it but someone with more
    //    JS experience can probably point out how this should be done.
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
        // TODO [ndrwksr | 3/16/20]: See https://github.com/zerobase-io/zerobase_firebase_functions/issues/2
        //  - Implement adding payloads so that the app can determine
        //    how to appropriately react to the message.
        // data: {
        //
        // }
    };

    return fcm.sendToTopic(topic, payload);
}