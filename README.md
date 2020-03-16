# Zerobase Firebase Functions
This repo contains the Firebase Functions required to operate the Zerobase app. Currently, those functions only include
sending a new message to relevant users when a new exposure has been detected, and sending a retraction message if an
exposure was added to the DB in err.

The current architecture of this system is "push" not "pull", meaning that other parts of the Zerobase system need only
to put new documents in the database or update their retraction flag, and nothing further. The Firestore database is
never queried, and primarily serves as a highly scalable audit log.

##Functions
####`messageOnNewExposure`
This function is invoked when a new document is created in the `/exposures` collection. It sends a message to the new
`Exposure`'s location fingerprint, meaning all users who have scanned that location will receive a push notification
in under a second after the `Exposure` document is created.

####`messageOnRetractedExposure`
Because we all make mistakes, if an `Exposure` document is created on accident and now should be retracted to avoid
unnecessary panic, this function offers an easy way to issue a retraction message to all relevant users. The function
is invoked upon any update to the `/exposures` collection, and if the retraction flag on the new `Exposure` is set,
the retraction message is sent. If said flag is unset, this function is a NOOP.