import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";

const Joi = require('@hapi/joi');

/**
 * An enum for the possible severities of an Exposure.
 * These details haven't been ironed out as of 3/16/20.
 */
export enum Severity {
    SUSPECTED = "SUSPECTED",
    TESTED_POSITIVE = "TESTED_POSITIVE"
}

/**
 * A class to represent a document in the exposures collection.
 * See constructor for explanations of each field.
 */
export class Exposure {
    /**
     * Schema for Joi validation.
     */
    static schema = Joi.object({
        intersected_at: Joi.date()
            .required(),
        intersection_device_fp: Joi.string()
            .alphanum()
            .required(),
        retracted: Joi.bool()
            .required(),
        severity: Joi.string()
            .valid([Severity.SUSPECTED, Severity.TESTED_POSITIVE])
            .required()
    });

    /**
     * Builds a new Exposure from a document snapshot.
     * @param intersected_at The time at which the exposed party intersected with the infected individual.
     * @param intersection_device_fp The device fingerprint representing the location at which the parties intersected.
     * @param retracted True if the exposure has been retracted (such as if it was sent in error). False otherwise.
     * @param severity The severity of the exposure. See Severity.
     */
    constructor(
        public intersected_at: Date,
        public intersection_device_fp: string,
        public retracted: boolean,
        public severity: Severity
    ) {
    }

    /**
     * Factory method, returns a new Exposure from a DocumentSnapshot.
     * @param snapshot The DocumentSnapshot from which the Exposure will be built.
     */
    static fromSnapshot(snapshot: DocumentSnapshot): Exposure {
        return new Exposure(
            snapshot.get('intersected_at'),
            snapshot.get('intersection_device_fp'),
            snapshot.get('retracted'),
            snapshot.get('severity')
        )
    }

    /**
     * Factory method, returns a new Exposure from a request body.
     * @param body The request body from which the Exposure will be built.
     */
    static fromReqBody(body: any) {
        return new Exposure(
            body.intersected_at,
            body.intersection_device_fp,
            body.retracted,
            body.severity
        )
    }

    /**
     * Extracts the data fields from the Exposure and puts them into a new object.
     * Used because Firestore cannot directly serialize Exposure objects.
     */
    public data() {
        return {
            intersected_at: new Date(this.intersected_at),
            intersection_device_fp: this.intersection_device_fp,
            retracted: this.retracted,
            severity: this.severity
        }
    }
}