# Zerobase Notification System
This repo contains the Firebase Functions required to operate the Zerobase notification system. 

When the tracing system identifies users who need to be instructed to take actions (shelter in place, get tested, etc.) 
it will invoke functionality offered by the Firebase Functions in this repo to do so. To send messages to users, the 
tracing system will make a POST to the /messaging endpoint with a MessagingRequest object (models/MessagingRequest.ts) 
with the contact details required to contact the user through the appropriate mediums. The tracing system can send 
between `[1, n]` contact details where `n` is the number of supported mediums (currently 3 for push notifications, SMS 
and email).

The messaging system will then send the appropriate messages (in parallel) and wait for all messaging functions to halt,
at which point it will colate the results and return them in a MessagingResponse object. Details of the outcomes of each
messaging attempt can be found in the response object.

## Getting Started
Google provides a very ergonomic set of tools for devloping/deploying Firebase Functions and (assuming you have `npm` 
installed) you can install it with the following command: `npm i -g firebase-tools`.

If you were added to the Firebase project, use `firebase login` to log into your Google account and gain the ability to 
deploy. You may infrequently encounter a situation where you do need to be added to the Firebase project and logged in, 
if this is the case reach out to Andrew Kaiser or John Lo.

Time to get hacking! Here's some good resources/commands:
* You can start the system for testing with `firebase serve`, and deploy with `firebase deploy`.
* Google's ["Get Started" guide](https://firebase.google.com/docs/functions/get-started) for Firebase functions
* Google's [guide to HTTP-event functions](https://firebase.google.com/docs/functions/http-events)

### Config Variables - The Open Issue You'll Probably Encounter
In order to keep our API keys and the like secure, this system uses Firebase's Function Configuration system. This means 
that these keys live in Firebase and not within the project, and are added via the CLI. If you get a crash where there's
some property in `functions.config()` that doesn't exist, it's because the system cannot find these config variables. 
This is still an open issue, if you encounter it ping Andrew Kaiser for further steps. You'll be given a configuration 
file that has these keys and instructions on how to use them

## Functions
### `webApi`
This function hooks in Express, see [Endpoints](#endpoints) for further details.

## Endpoints
### /messaging
#### `POST`
Creates a new document in the `/messages` collection and sends the message. Does not respond until message has been sent
so that success/failure can be communicated back. A new document is made regardless or success or failure. All three 
contact details fields are optional, but at least one option must be present (or else what's the point?). A failure in 
any of the messaging attempts (push notification, email, text) will cause the response status to be 500, even if only 
one messaging attempt failed. The information to determine the exact failure mode is included in the response body.

See examples for phone number format.

Example Body:
```json
{
  "messageType":"GET_TESTED",
  "token":"[REDACTED]",
  "locale":"en-US",
  "contactDetails":{
  	"deviceFp":"aaaabbbbccccddddeeeeffff",
  	"phoneNumber":"+15551234567",
  	"email":"info@zerobase.io"
  }
}
```

Example Success Response:
```json
// STATUS: 200
// Note: Token is stripped off response 

{
  "messageType": "GET_TESTED",
  "locale": "en-US",
  "contactDetails": {
    "deviceFp": "aaaabbbbccccddddeeeeffff",
    "phoneNumber": "+15551234567",
    "email": "info@zerobase.io"
  },
  "messageResults": {
    "deviceFp": {
      "didSucceed": true,
      "data": {...}
    },
    "email": {
      "didSucceed": true,
      "data": {...}
    },
    "phoneNumber": {
      "didSucceed": true,
      "data": {...}
    }
  }
}
```

Example Failure Response (Happy Path):
```json
// Issue: Email failed
// STATUS: 200

{
  "messageType":"GET_TESTED",
  "locale":"en-US",
  "contactDetails": {
    "deviceFp":"aaaabbbbccccddddeeeeffff",
    "phoneNumber":"+15551234567",
    "email":"info@zerobase.io"
  },
  "messageResults": {
    "deviceFp": {
      "didSucceed":true,
      "data": {...}
    },
    "phoneNumber": {
      "didSucceed":true,
      "data": {...}
    },
    "email": {
      "didSucceed":false,
      "error": {...}
    }
  }
}
```

```json

```

## Firebase Functions Configuration
| Group    | Key        | Description                                                        | Value              |
|----------|------------|--------------------------------------------------------------------|--------------------|
| twilio   | sid        | The SID for our Twilio account.                                    | Private            |
|          | token      | The API token for our Twilio account.                              | Private            |
|          | phoneno    | The phone number which Twilio will use to send texts.              | Private            |
| mailgun  | from_email | The email address from which our notification emails will be sent. | `info@zerobase.io` |
|          | domain     | The domain of our host for SMTP.                                   | `mail.zerobase.io` |
|          | from_title | The human-readable name of the sender.                             | `Zerobase`         |
|          | api_key    | The API key for Mailgun.                                           | Private            |
| zerobase | token      | The API token for this system.                                     | Private            |