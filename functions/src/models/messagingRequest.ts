import {getMessageType, MessageType} from "./messageType";

const Joi = require('@hapi/joi');

/**
 * A class to represent a document in the exposures collection.
 * See constructor for explanations of each field.
 */
export class MessagingRequest {
    /**
     * Schema for Joi validation.
     */
    static schema = Joi.object({
        // TODO [ndrwksr | 3/18/20]: No GH issue yet, feel free to make one.
    });

    /**
     * Builds a new Exposure from a document snapshot.
     * @param messageType The type of message to be sent. See MessageType.
     * @param locale The locale for messages.
     * @param contactDetails A map between the messaging mediums in use and their appropriate contact info.
     */
    constructor(
        public messageType: MessageType,
        public locale: string,
        public contactDetails: { [key:string]: string; }
    ) {
    }

    /**
     * Factory method, returns a new Exposure from a request body.
     * @param body The request body from which the Exposure will be built.
     */
    static fromReqBody(body: any) {
        return new MessagingRequest(
            getMessageType(body.messageType),
            body.locale,
            body.contactDetails
        )
    }
}