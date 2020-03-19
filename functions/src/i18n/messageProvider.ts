import {MessageType} from "../models/messageType";

export function getPnTitleForLocale(messageType: MessageType, locale: string) {
    // TODO [ndrwksr | 3/18/20]: Impl (for real)
    switch (messageType) {
        case MessageType.GET_TESTED:
            return "New SARS-COV-2 Exposure; Time To Get Tested.";
        case MessageType.SELF_ISOLATE:
            return "New SARS-COV-2 Exposure; Time To Self-Isolate";
    }
}

export function getPnBodyForLocale(messageType: MessageType, locale: string) {
    // TODO [ndrwksr | 3/18/20]: Impl (for real)
    switch (messageType) {
        case MessageType.GET_TESTED:
            return "Don't panic! We've got your covered, and are here to help.\n"
                + "Open the app for help finding a testing site.";
        case MessageType.SELF_ISOLATE:
            return "Don't panic! Social distancing is our most powerful tool.\n"
                + "Open the app for further instructions.";
    }
}

export function getEmailSubjectForLocale(messageType: MessageType, locale: string) {
    // TODO [ndrwksr | 3/18/20]: Impl
    return "email subject"
}

export function getEmailBodyForLocale(messageType: MessageType, locale: string) {
    // TODO [ndrwksr | 3/18/20]: Impl
    return "email body"
}

export function getSmsMessageForLocale(messageType: MessageType, locale: string) {
    // TODO [ndrwksr | 3/18/20]: Impl
    return "SMS message"
}
