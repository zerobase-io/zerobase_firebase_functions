/**
 * An enum for the mediums we can use to message a user, including push notifications, SMS and email.
 */
export enum MessagingMedium {
    DEVICE_FP = "deviceFp",
    PHONE_NUMBER = "phoneNumber",
    EMAIL = "email"
}

export const MessagingMediums = [
    MessagingMedium.DEVICE_FP,
    MessagingMedium.PHONE_NUMBER,
    MessagingMedium.EMAIL
];

export function getMessagingMedium(str: string): MessagingMedium {
    switch (str) {
        case MessagingMedium.DEVICE_FP:
            return MessagingMedium.DEVICE_FP;
        case MessagingMedium.PHONE_NUMBER:
            return MessagingMedium.DEVICE_FP;
        case MessagingMedium.EMAIL:
            return MessagingMedium.EMAIL;
        default:
            throw new Error("Invalid messaging medium: " + str);
    }
}