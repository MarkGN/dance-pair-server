// const functions = require("firebase-functions");

// // // Create and deploy your first functions
// // // https://firebase.google.com/docs/functions/get-started
// //
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// const dotenv = require("dotenv");
// dotenv.config();

// const firebaseConfig = require("./firebase-config.json");
// const {addDoc, doc}=//, getDoc, runTransaction, serverTimestamp, setDoc } = 
//   require("firebase/firestore");

// const admin = require("firebase-admin");

// admin.initializeApp({
//   credential: admin.credential.cert(firebaseConfig),
//   databaseURL: "https://dance-pair.firebaseio.com",
// }); // maybe add australia-east-1 or something?

// const db = admin.firestore();

// /*
// DB should have:
// * name
// * time
// * location
// * description
// * ?endTime
// * ?maxGuests
// * !{boys, girls}{registered, invited}

// Registrants should have:
// * name
// * email
// * sex
// * ?deadline
// */

// function sanityCheck(body, res, fields) {
//   fields.forEach((field) => {
//     if (!body[field]) {
//       res.sendStatus(400);
//       res.send(String(field) + " missing");
//       return true;
//     }
//   });
//   return false;
// }

// const sexes = ["male", "female"]; 
// // TODO: store in event, so that users can rename as they like

// exports.new = functions.https.onRequest(async (req, res) => {
//   const body = req.body;
//   if (sanityCheck(body, res, ["name", "time", "location", "description"])) {
//     return;
//   }
//   if (new Date() > new Date(body.time)) {
//     res.sendStatus(400);
//     res.send("time must be in future");
//     return;
//   }
//   try {
//     const e = {
//       "name": body.name,
//       "time": body.time,
//       "location": body.location,
//       "description": body.description,
//       "endTime": new Date(new Date(body.time).getTime()+60000),
//     };
//     sexes.forEach((sex) => {
//       ["Registered", "Invited"].forEach((stage) => {
//         e[sex+stage] = {};
//       });
//     });
//     const eventId = await addDoc(doc(db, "events"), e);
//     res.sendStatus(201); // Send a success status code
//     res.send(eventId);
//   } catch (error) {
//     console.error(error);
//     res.sendStatus(500); // Send an error status code
//   }
// });

// // Handler for POST request to /events
// // TODO include functionality for event creator to insta-register
// // app.post('/new', async (req, res) => {
// //   const body = req.body;
// //   if (sanityCheck(body, res, ["name", "time", "location", "description"])) {
// //     return;
// //   }
// //   if (new Date() > new Date(body.time)) {
// //     res.sendStatus(400);
// //     res.send("time must be in future");
// //     return;
// //   }
// //   try {
// //     const e = {
// //       "name": body.name,
// //       "time": body.time,
// //       "location": body.location,
// //       "description": body.description,
// //       "endTime": new Date(new Date(body.time).getTime()+60000)
// //     };
// //     sexes.forEach(sex => {
// //       ["Registered", "Invited"].forEach(stage => {
// //         e[sex+stage] = {};
// //       })
// //     });
// //     await addDoc(doc(db, "events"), e);
// //     res.sendStatus(201); // Send a success status code
// //   } catch (error) {
// //     console.error(error);
// //     res.sendStatus(500); // Send an error status code
// //   }
// // });


// // app.post("/register", async (req, res) => {
// //   const body = req.body;
// //   if (sanityCheck(body, res, ["name", "email", "sex", "eventId"])) {
// //     return;
// //   }

// //   try {
// //     await runTransaction(db, async (t) => {
// //       const event = await getDoc(doc(db, "events", body.eventId));
// //       const oppositeSex = body.sex == "male" ? 
// // "female" : "male"; // TODO this is ugly
// //       const potentialPartners = event[oppositeSex+"Registered"];
// //       var isInvited = false;
// //       const expiredRegistrants = []
// //       while (Object.keys(potentialPartners).length) {
// //         // then take the first registree 
// // from there to Invited, put this one onto Invited, and send emails;
// //         // or rather make this into a while, removing any whose 
// // deadline has expired
// //         const partner = potentialPartners; // TODO .get whichever 
// // has the lowest timestamp;
// //         if (new Date(partner.timestamp) < new Date()) {
// //           // remove that partner, both here and in the DB
// //           expiredRegistrants.push(partner);
// //           delete potentialPartners[partner]; // does this work?
// //         } else {
// //           // invite both
// //           isInvited = true;
// //           potentialPartners = []; // so that we exist the loop
// //           // send emails; move both to the Invited sets
// //         }
// //       } 

// //       if (!isInvited) {
// //         // set the doc's sex Registered 
// // to also include the registrant, with this timestamp
// //         // TODO this should absolutely be factored out, so that /new and /register reuse code
// //         return {
// //           timestamp: serverTimestamp()
// //         }
// //       }
// //     })
// //   } catch (err) {
// //     console.error(err);
// //     res.sendStatus(500);
// //   }
// // });

// // app.get('/hello', async (req, res) => {
// //   res.send('Hello, World! Adding page because why not!');
// //   // await setDoc(doc(db, "events", 23), {"one": 1, "two":2});
// //   // db.collection('events').add({"one": 1, "two":2});
// //   // console.log((await 
// // db.collection('events').doc("NuQwxezamT6OpT1tOTG6").get()).data());
// //   const query = db.collection("events").where("one", "==", 1);
// //   const result = await query.get();
// //   result.forEach(r => {
// //     console.log(r.id, r.data())
// //   });
// //   console.log(result);
// //   console.log("done")
// // });

// // app.get('/test', async (req, res) => {
// //   res.send('Tests!');
// // });

// // app.get('/params/:id', async (req, res) => {
// //   res.send(req.params.id);
// // });

// // // NuQwxezamT6OpT1tOTG6
// // app.get('/events/:eventId', async (req, res) => {
// //   const eventId = req.params.eventId;
// //   // res.send("basic");

// //   try {
// //     console.log(admin.firestore().collection('events'))
// //     const eventRef = admin.firestore().collection('events').doc(eventId);
// //     const eventDoc = await eventRef.get();

// //     if (!eventDoc.exists) {
// //       res.status(404).send('Event not found');
// //     } else {
// //       res.send(eventDoc.data());
// //     }
// //   } catch (error) {
// //     console.error(error);
// //     res.status(500).send('Server error');
// //   }
// // });
