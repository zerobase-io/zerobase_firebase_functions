import {MessagingRequest} from "./messagingRequest";
import {MessageType} from "./messageType";
import {MessagingMedium} from "./messagingMedium";
import {MessagingOutcome} from "./messagingOutcome";

/**
 * An object that represents a response to a messaging request. Has all the original info from the request,
 * in addition to the results of the messaging attempts and the ID of the created audit document.
 */
export class MessagingResponse extends MessagingRequest {
    constructor(
        public _id: String | undefined,
        messageType: MessageType,
        locale: string,
        contactDetails: Map<MessagingMedium, string>,
        public messageResults: Map<MessagingMedium, MessagingOutcome>
    ) {
        super(messageType, locale, contactDetails);
    }
}