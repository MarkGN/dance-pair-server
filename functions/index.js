const functions = require("firebase-functions");
const cors = require('cors')({origin: true});
// const cors = require('cors')({origin: ['https://example.com', 'https://www.example.com']});
// ... to make it only accept from, say, my front-end

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = functions.https.onRequest((req, res) => {
//   cors(req, res, () => {
//     functions.logger.info("Hello logs!", {structuredData: true});
//     res.send("Hello from Firebase!");
//   });
// });

exports.helloWorld = functions.https.onRequest((req, res) => {
  console.log(req.headers)
  cors(req, res, () => {
    res.status(200).send('Hello, World!');
  });
});

const dotenv = require("dotenv");
dotenv.config();

const firebaseConfig = require("./firebase-config.json");
const {addDoc, doc, getDoc, runTransaction, serverTimestamp, setDoc } = require("@firebase/firestore");

const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
  databaseURL: process.env.DB_URL,
});

const db = admin.firestore();
/*
DB should have:
* name
* time
* location
* description
* ?endTime
* ?maxGuests
* !{boys, girls}{registered, invited}

Registrants should have:
* name
* email
* sex
* ?deadline
*/

function sanityCheck(body, fields) {
  fields.forEach((field) => {
    if (!body[field]) {
      return field;
    }
  });
  return false;
}

const sexes = ["male", "female"]; 
// TODO: store in event, so that users can rename as they like

exports.new = functions.https.onRequest(async (req, res) => {
  const body = req.body;
  const check = sanityCheck(body, ["name", "time", "location", "description"]);
  if (check) {
    res.sendStatus(500);
    res.send(check + " missing");
  }
  if (new Date() > new Date(body.time)) {
    res.sendStatus(500);
    res.send("time must be in future");
    return;
  }
  try {
    const e = {
      "name": body.name,
      "time": body.time,
      "location": body.location,
      "description": body.description,
      "endTime": new Date(new Date(body.time).getTime()+60000),
    };
    sexes.forEach((sex) => {
      ["Registered", "Invited"].forEach((stage) => {
        e[sex+stage] = {};
      });
    });
    const eventId = await addDoc(doc(db, "events"), e);
    res.sendStatus(201);
    res.send(eventId);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});
