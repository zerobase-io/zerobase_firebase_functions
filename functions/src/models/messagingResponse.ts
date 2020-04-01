import {MessagingRequest} from "./messagingRequest";
import {MessageType} from "./messageType";
import {MessagingOutcome} from "./messagingOutcome";

/**
 * An object that represents a response to a messaging request. Has all the original info from the request,
 * in addition to the results of the messaging attempts and the ID of the created audit document.
 */
export class MessagingResponse extends MessagingRequest {
    constructor(
        messageType: MessageType,
        locale: string,
        contactDetails: { [key: string]: string; },
        data: any,
        public messageResults: { [key: string]: MessagingOutcome; }
    ) {
        super(messageType, undefined, locale, contactDetails, data);
        this.messageResults = messageResults;
    }
}