import * as admin from "firebase-admin";
import {MessagingRequest} from "./models/messagingRequest";
import {MessagingMedium} from "./models/messagingMedium";
import {MessagingResponse} from "./models/messagingResponse"
import {MessagingOutcome} from "./models/messagingOutcome"
import {
    getEmailBodyForLocale,
    getEmailSubjectForLocale,
    getPnBodyForLocale,
    getPnTitleForLocale,
    getSmsMessageForLocale
} from "./i18n/messageProvider";

export function acceptNewMessageRequest(fcm: admin.messaging.Messaging): (message: MessagingRequest) => Promise<MessagingResponse> {
    return function (message: MessagingRequest): Promise<MessagingResponse> {
        const deviceFp = message.contactDetails[MessagingMedium.DEVICE_FP];
        let pnPromise: Promise<MessagingOutcome> | undefined = undefined;
        if (deviceFp) {
            pnPromise = sendToTopic(
                getPnTitleForLocale(message.messageType, message.locale),
                getPnBodyForLocale(message.messageType, message.locale),
                deviceFp,
                fcm
            )
        }

        const emailAddress = message.contactDetails[MessagingMedium.EMAIL];
        let emailPromise: Promise<MessagingOutcome> | undefined = undefined;
        if (emailAddress) {
            emailPromise = sendEmail(
                getEmailSubjectForLocale(message.messageType, message.locale),
                getEmailBodyForLocale(message.messageType, message.locale),
                emailAddress
            )
        }

        const phoneNumber = message.contactDetails[MessagingMedium.PHONE_NUMBER];
        let smsPromise: Promise<MessagingOutcome> | undefined = undefined;
        if (phoneNumber) {
            smsPromise = sendSms(
                getSmsMessageForLocale(message.messageType, message.locale),
                phoneNumber
            )
        }

        return Promise.all([pnPromise, smsPromise, emailPromise]).then(values => {
            let pnOutcome = values[0];
            let emailOutcome = values[1];
            let smsOutcome = values[2];

            let messagingOutcomes: { [key:string]: MessagingOutcome; } = {};
            if (pnOutcome) {
                console.log("Attempted push notification:", pnOutcome);
                messagingOutcomes[MessagingMedium.DEVICE_FP] = pnOutcome;
            }

            if (emailOutcome) {
                console.log("Attempted email:", emailOutcome);
                messagingOutcomes[MessagingMedium.EMAIL] = emailOutcome;
            }

            if (smsOutcome) {
                console.log("Attempted SMS:", smsOutcome);
                messagingOutcomes[MessagingMedium.PHONE_NUMBER] = smsOutcome;
            }

            console.log("messaging outcomes:", messagingOutcomes);

            let response = new MessagingResponse(
                message.messageType,
                message.locale,
                message.contactDetails,
                messagingOutcomes
            );

            console.log("response", response);
            return response;
        })
    }
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
function sendToTopic(
    title: string,
    body: string,
    topic: string,
    fcm: admin.messaging.Messaging
): Promise<MessagingOutcome> {
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

    return new Promise(resolve => {
        fcm.sendToTopic(topic, payload).then(messagingResponse => {
            if (messagingResponse) {
                resolve(new MessagingOutcome(true, undefined))
            } else {
                resolve(new MessagingOutcome(false, "fcm.sendToTopic returned undefined"))
            }
        }).catch(e => {
            resolve(new MessagingOutcome(false, e))
        })
    });
}

function sendEmail(
    subject: string,
    body: string,
    emailAddress: string
): Promise<MessagingOutcome> {
    // NO REJECTIONS! Resolve with a MessagingOutcome instead.
    console.log("sendEmail:", subject, body, emailAddress);
    return Promise.resolve(new MessagingOutcome(true, undefined))
}

function sendSms(
    text: string,
    phoneNumber: string
): Promise<MessagingOutcome> {
    // NO REJECTIONS! Resolve with a MessagingOutcome instead.
    console.log("sendSms:", text, phoneNumber);
    return Promise.resolve(new MessagingOutcome(true, undefined))
}