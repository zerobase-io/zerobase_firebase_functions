import * as admin from "firebase-admin";
import * as functions from 'firebase-functions';
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
import {MessageType} from "./models/messageType";
import {Twilio} from "twilio";
import * as crypto from "crypto";

/**
 * Returns a function that processes MessagingRequests and sends the messages outline in the request.
 * @param fcm The messaging provider to use to send push notifications.
 * @param twilio The Twilio client to be used to send SMS messages.
 * @param mailgun The Mailgun client to be used to send emails.
 */
export function acceptNewMessageRequest(
    fcm: admin.messaging.Messaging,
    twilio: Twilio,
    mailgun: any
): (message: MessagingRequest) => Promise<MessagingResponse> {
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
                getPnTitleForLocale(message.messageType, message.locale, message.data),
                getPnBodyForLocale(message.messageType, message.locale, message.data),
                deviceFp,
                message.messageType,
                message.data,
                fcm
            )
        }

        // Send email
        const emailAddress = message.contactDetails[MessagingMedium.EMAIL];
        let emailPromise: Promise<MessagingOutcome> | undefined = undefined;
        if (emailAddress) {
            emailPromise = sendEmail(
                getEmailSubjectForLocale(message.messageType, message.locale, message.data),
                getEmailBodyForLocale(message.messageType, message.locale, message.data),
                emailAddress,
                mailgun
            ).catch(e => new MessagingOutcome(false, e, undefined))
        }

        // Send SMS
        const phoneNumber = message.contactDetails[MessagingMedium.PHONE_NUMBER];
        let smsPromise: Promise<MessagingOutcome> | undefined = undefined;
        if (phoneNumber) {
            smsPromise = sendSms(
                getSmsMessageForLocale(message.messageType, message.locale, message.data),
                phoneNumber,
                twilio
            ).catch(e => new MessagingOutcome(false, e, undefined))
        }

        // Wait for all to complete, collate outcomes and return
        return Promise.all([pnPromise, emailPromise, smsPromise]).then(values => {
            const pnOutcome = values[0];
            const emailOutcome = values[1];
            const smsOutcome = values[2];

            const messagingOutcomes: { [key: string]: MessagingOutcome; } = {};
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

            const response = new MessagingResponse(
                message.messageType,
                message.locale,
                message.contactDetails,
                message.data,
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
 * @param type The type of the message being sent.
 * @param data Extra parameters for special message types.
 * @param fcm The Messaging instance to send the messages with.
 */
function sendToTopic(
    title: string,
    body: string,
    topic: string,
    type: MessageType,
    data: any,
    fcm: admin.messaging.Messaging
): Promise<MessagingOutcome> {
    console.log("sendToTopic", title, body, topic);
    const payload: admin.messaging.MessagingPayload = {
        notification: {
            title: title,
            body: body,
            icon: 'https://zerobase.io/dist/img/zerobase_medium_logo.png',
        },
        data: {
            // This doesn't have to be secure, this is just a UID so that when the app receives the same message several
            // times (bug in FCM Flutter plugin), we can throw out the repeat messages.
            id: crypto.randomBytes(20).toString('hex'),
            messageType: type,
            phoneNumber: data.phoneNumber,
            click_action: 'FLUTTER_NOTIFICATION_CLICK', // required only for onResume or onLaunch callbacks
        }
    };

    return new Promise(resolve => {
        fcm.sendToTopic(topic, payload).then(messagingResponse => {
            resolve(new MessagingOutcome(true, undefined, messagingResponse))
        }).catch(e => {
            resolve(new MessagingOutcome(false, e, undefined))
        })
    });
}

/**
 * Sends an email to the provided address with the provided subject and body.
 * @param subject The subject of the email.
 * @param body The body of the email.
 * @param emailAddress The address to which the email will be sent.
 * @param mailgun The Mailgun client to send emails with.
 */
function sendEmail(
    subject: string,
    body: string,
    emailAddress: string,
    mailgun: any
): Promise<MessagingOutcome> {
    console.log("sendEmail:", subject, body, emailAddress);

    return new Promise((resolve, reject) => {
        mailgun.sendMail({
            from: mailgun.__from,
            to: emailAddress,
            subject: subject,
            text: body
        }, (err: Error, info: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(info);
            }
        })
    }).then((result: any) => new MessagingOutcome(true, undefined, result));
}

/**
 * Sends an SMS message with the provided text to the provided phone number.
 * @param text The text to send in the SMS message.
 * @param phoneNumber The phone number to which the SMS message will be sent.
 * @param twilio The Twilio client to send SMS messages with.
 */
function sendSms(
    text: string,
    phoneNumber: string,
    twilio: Twilio
): Promise<MessagingOutcome> {
    console.log("sendSms:", text, phoneNumber);
    // TODO [ndrwksr | 3/19/20] https://github.com/zerobase-io/zerobase_firebase_functions/issues/13
    return twilio.messages
        .create({
            body: text,
            from: functions.config()["twilio"]["phoneno"],
            to: phoneNumber
        })
        .then(message => new MessagingOutcome(true, undefined, message));
}