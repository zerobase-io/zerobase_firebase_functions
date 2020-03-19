# Zerobase Firebase Functions
This repo contains the Firebase Functions required to operate the Zerobase app. 

The system takes a message request (detailed in endpoint doc) and sends a message using each of the provided contact details.

Get added to the Firebase project and download firebase tools with `npm i -g firebase-tools`

Login with `firebase login`

You can start the system for testing with `firebase serve` and deploy with `firebase deploy`.

https://firebase.google.com/docs/functions/get-started

https://firebase.google.com/docs/functions/http-events

## Endpoints
### /messaging
#### `POST`
Creates a new document in the `/messages` collection and sends the message. Does not respond until message has been sent so that success/failure can be communicated back. A new document is made regardless or success or failure. All three contact details fields are optional, but at least one option must be present (or else what's the point?). A failure in any of the messaging attempts (push notification, email, text) will cause the response status to be 500, even if only one messaging attempt failed. The information to determine the exact failure mode is included in the response body.

Example Body:
```json
{
  "messageType":"GET_TESTED",
  "contactDetails": {
    "deviceFp":"ABC123",
    "phoneNumber":"555-123-4567",
    "email":"test@zerobase.io"
  }
}
```

Example Success Response:
```json
STATUS: 201
{
  "_id":"asdfghjklzxcvbnm"
  "messageType":"GET_TESTED",
  "contactDetails": {
    "deviceFp":"ABC123"
    "phoneNumber":"555-123-4567"
    "email":"test@zerobase.io"
  },
  "messageResults": {
    "deviceFp": {
      "didSucceed":true,
    }
    "phoneNumber": {
      "didSucceed":true,
    }
    "email": {
      "didSucceed":true,
    }
  }
}
```

Example Failure Response:
```json
STATUS: 500
{
  "_id":"asdfghjklzxcvbnm"
  "messageType":"GET_TESTED",
  "contactDetails": {
    "deviceFp":"ABC123"
    "phoneNumber":"555-123-4567"
    "email":"test@zerobase.io"
  },
  "messageResults": {
    "deviceFp": {
      "didSucceed":true,
    }
    "phoneNumber": {
      "didSucceed":true,
    }
    "email": {
      "didSucceed":false,
      "error": {
        Undefined as of 13:56 CDT 3/18/20
      }
    }
  }
}
```

Expected Errors:
422 - Bad Request Body
404 - Device FP Doesn't Exist (User Hasn't Installed App)

## Functions
### `webApi`
This function hooks in Express, see Endpoints for further details.
