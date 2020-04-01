import {MessageType} from "../models/messageType";

export function getPnTitleForLocale(messageType: MessageType, locale: string, data: any): string {
    // TODO [ndrwksr | 3/18/20]: Impl (for real)
    switch (messageType) {
        case MessageType.GET_TESTED:
            return "New SARS-COV-2 Exposure; Time To Get Tested.";
        case MessageType.SELF_ISOLATE:
            return "New SARS-COV-2 Exposure; Time To Self-Isolate";
        case MessageType.PLEASE_CALL:
            return "Please Call Immediately";
        case MessageType.CUSTOM:
            return data.pnTitle;
    }
}

export function getPnBodyForLocale(messageType: MessageType, locale: string, data: any): string {
    // TODO [ndrwksr | 3/18/20]: Impl (for real)
    switch (messageType) {
        case MessageType.GET_TESTED:
            return "Don't panic! We've got your covered, and are here to help.\n"
                + "Open the app for help finding a testing site.";
        case MessageType.SELF_ISOLATE:
            return "Don't panic! Social distancing is our most powerful tool.\n"
                + "Open the app for further instructions.";
        case MessageType.PLEASE_CALL:
            return "Your public health authority needs to speak with you immediately.\n"
                + "Open the app to dial now.";
        case MessageType.CUSTOM:
            return data.pnBody;
    }
}

export function getEmailSubjectForLocale(messageType: MessageType, locale: string, data: any): string {
    // TODO [ndrwksr | 3/18/20]: Impl (for real)
    switch (messageType) {
        case MessageType.GET_TESTED:
            return "New SARS-COV-2 Exposure; Time To Get Tested.";
        case MessageType.SELF_ISOLATE:
            return "New SARS-COV-2 Exposure; Time To Self-Isolate";
        case MessageType.PLEASE_CALL:
            return "Please Call Immediately";
        case MessageType.CUSTOM:
            return data.emailSubject;
    }
}

export function getEmailBodyForLocale(messageType: MessageType, locale: string, data: any): string {
    // TODO [ndrwksr | 3/18/20]: Impl (for real)
    switch (messageType) {
        case MessageType.GET_TESTED:
            return "Don't panic! We're here to help get you tested ASAP.";
        case MessageType.SELF_ISOLATE:
            return "Don't panic! Social distancing is our most powerful tool.";
        case MessageType.PLEASE_CALL:
            return "Your public health authority needs to speak with you immediately.\n" +
                "Please call the following number: " + data.phoneNumber;
        case MessageType.CUSTOM:
            return data.emailBody;
    }
}

export function getSmsMessageForLocale(messageType: MessageType, locale: string, data: any): string {
    switch (messageType) {
        case MessageType.GET_TESTED:
            return "New SARS-COV-2 Exposure; Time To Get Tested.";
        case MessageType.SELF_ISOLATE:
            return "New SARS-COV-2 Exposure; Time To Self-Isolate";
        case MessageType.PLEASE_CALL:
            return "Your public health authority needs to speak with you immediately.\n" +
                "Please call the following number: " + data.phoneNumber;
        case MessageType.CUSTOM:
            return data.sms;
    }
}
