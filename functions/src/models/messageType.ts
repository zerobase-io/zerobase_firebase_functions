/**
 * An enum for the types of messages we can send, either to self isolate or get tested.
 */
export enum MessageType {
    SELF_ISOLATE = "SELF_ISOLATE",
    GET_TESTED = "GET_TESTED"
}

export const MessageTypes = [
    MessageType.SELF_ISOLATE,
    MessageType.GET_TESTED
];

export function getMessageType(str: string): MessageType {
    switch (str) {
        case MessageType.GET_TESTED:
            return MessageType.GET_TESTED;
        case MessageType.SELF_ISOLATE:
            return MessageType.SELF_ISOLATE;
        default:
            throw new Error("Invalid message type: " + str);
    }
}