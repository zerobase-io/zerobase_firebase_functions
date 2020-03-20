# Zerobase Notification System
This repo contains the Firebase Functions required to operate the Zerobase notification system. 

When the tracing system identifies users who need to be instructed to take actions (shelter in place, get tested, etc.) it will invoke
functionality offered by the Firebase Functions in this repo to do so. To send messages to users, the tracing system will make a POST to
the /messaging endpoint with a MessagingRequest object (models/MessagingRequest.ts) with the contact details required to contact the 
user through the appropriate mediums. The tracing system can send between [1, n] contact details where n is the number of supported 
mediums (currently 3 for push notifications, SMS and email).

The messaging system will then send the appropriate messages (in parallel) and wait for all messaging functions to halt, at which point
it will colate the results and return them in a MessagingResponse object. If any of the mediums failed the status code of the response
will be 500, otherwise it will be 201 (CREATED because we created a new object in our Firestore /messaging collection and are now
returning that object to the user). Details of the outcomes of each messaging attempt can be found in the response object. The other two 
expected error statuses are 422 for a bad request object, and 404 if the client attempts to send a push notification to a device that
doesn't have the app installed.

## Getting Started
First, reach out to John Lo for access to the Firebase project. You don't need this permission to test/hack on this system, but you 
will need it to deploy your changes. Not everyone needs this access, but deploying is currently the best way to test changes so it's
highly recommended for the time being.

Google provides a very ergonomic set of tools for devloping/deploying Firebase Functions and (assuming you have `npm` installed)
you can install it with the following command: `npm i -g firebase-tools`.

If you were added to the Firebase project, use `firebase login` to log into your Google account and gain the ability to deploy.

Time to get hacking! Here's some good resources/commands:

* You can start the system for testing with `firebase serve`, and deploy with `firebase deploy`.

* Google's ["Get Started" guide](https://firebase.google.com/docs/functions/get-started) for Firebase functions (more specific 
intructions for what I've laid out here)

* Google's [guide to HTTP-event functions](https://firebase.google.com/docs/functions/http-events)

## Endpoints
### /messaging
#### `POST`
Creates a new document in the `/messages` collection and sends the message. Does not respond until message has been sent so that success/failure can be communicated back. A new document is made regardless or success or failure. All three contact details fields are optional, but at least one option must be present (or else what's the point?). A failure in any of the messaging attempts (push notification, email, text) will cause the response status to be 500, even if only one messaging attempt failed. The information to determine the exact failure mode is included in the response body.

See examples for phone number format.

Example Body:
```json
{
  "messageType":"GET_TESTED",
  "locale":"en-US",
  "contactDetails": {
    "deviceFp":"ABC123",
    "phoneNumber":"+15551234567",
    "email":"test@zerobase.io"
  }
}
```

Example Success Response:
```json
STATUS: 201
{
  "_id":"asdfghjklzxcvbnm",
  "messageType":"GET_TESTED",
  "locale":"en-US",
  "contactDetails": {
    "deviceFp":"ABC123",
    "phoneNumber":"+15551234567",
    "email":"test@zerobase.io"
  },
  "messageResults": {
    "deviceFp": {
      "didSucceed":true
    },
    "phoneNumber": {
      "didSucceed":true
    },
    "email": {
      "didSucceed":true
    }
  }
}
```

Example Failure Response:
```json
STATUS: 500
{
  "_id":"asdfghjklzxcvbnm",
  "messageType":"GET_TESTED",
  "locale":"en-US",
  "contactDetails": {
    "deviceFp":"ABC123",
    "phoneNumber":"+15551234567",
    "email":"test@zerobase.io"
  },
  "messageResults": {
    "deviceFp": {
      "didSucceed":true
    },
    "phoneNumber": {
      "didSucceed":true
    },
    "email": {
      "didSucceed":false,
      "error": {
        //Undefined as of 13:56 CDT 3/18/20
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


## Config
#### Twilio
##### sid
The SID for our Twilio account.

##### token
The API token for our Twilio account.

##### phoneno
The phone number which Twilio will use to send texts.

