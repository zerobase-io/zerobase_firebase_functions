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

/**
 * Returns a function that processes MessagingRequests and sends the messages outline in the request.
 * @param fcm The messaging provider to use to send push notifications.
 */
export function acceptNewMessageRequest(fcm: admin.messaging.Messaging): (message: MessagingRequest) => Promise<MessagingResponse> {
    /**
     * Returns a Promise<MessagingResponse> with the results of the system's attempts to honour the MessagingRequest.
     * @param message The MessagingRequest containing required contact details and type of message to be sent.
     */
    return function (message: MessagingRequest): Promise<MessagingResponse> {
        // TODO [ndrwksr | 3/19/20]: This is an ideal candidate for some refactoring to make adding more messaging
        //  mediums easier and put some of this functionality behind interfaces.

        // Send push notification
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

        // Send email
        const emailAddress = message.contactDetails[MessagingMedium.EMAIL];
        let emailPromise: Promise<MessagingOutcome> | undefined = undefined;
        if (emailAddress) {
            emailPromise = sendEmail(
                getEmailSubjectForLocale(message.messageType, message.locale),
                getEmailBodyForLocale(message.messageType, message.locale),
                emailAddress
            ).catch(e => new MessagingOutcome(false, e))
        }

        // Send SMS
        const phoneNumber = message.contactDetails[MessagingMedium.PHONE_NUMBER];
        let smsPromise: Promise<MessagingOutcome> | undefined = undefined;
        if (phoneNumber) {
            smsPromise = sendSms(
                getSmsMessageForLocale(message.messageType, message.locale),
                phoneNumber
            ).catch(e => new MessagingOutcome(false, e))
        }

        // Wait for all to complete, collate outcomes and return
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
            resolve(new MessagingOutcome(true, undefined))
        }).catch(e => {
            resolve(new MessagingOutcome(false, e))
        })
    });
}

/**
 * Sends an email to the provided address with the provided subject and body.
 * @param subject The subject of the email.
 * @param body The body of the email.
 * @param emailAddress The address to which the email will be sent.
 */
function sendEmail(
    subject: string,
    body: string,
    emailAddress: string
): Promise<MessagingOutcome> {
    console.log("sendEmail:", subject, body, emailAddress);
    // TODO [ndrwksr | 3/19/20] https://github.com/zerobase-io/zerobase_firebase_functions/issues/12
    return Promise.resolve(new MessagingOutcome(true, undefined))
}

/**
 * Sends an SMS message with the provided text to the provided phone number.
 * @param text The text to send in the SMS message.
 * @param phoneNumber The phone number to which the SMS message will be sent.
 */
function sendSms(
    text: string,
    phoneNumber: string
): Promise<MessagingOutcome> {
    console.log("sendSms:", text, phoneNumber);
    // TODO [ndrwksr | 3/19/20] https://github.com/zerobase-io/zerobase_firebase_functions/issues/13
    return Promise.resolve(new MessagingOutcome(true, undefined))
}