/**
 * The outcome of a messaging attempt. didSucceed will always be present, error will
 * only be present if there is an error to report.
 */
export class MessagingOutcome {
    constructor(
        public didSucceed: boolean,
        public error: any
    ) {
    }
}