require("dotenv").config();
const functions = require("firebase-functions");
const cors = require('cors')({origin: true});
// const cors = require('cors')({origin: ['https://example.com', 'https://www.example.com']});
// ... to make it only accept from, say, my front-end
const { initializeApp } = require("@firebase/app");
const {addDoc, collection, doc, getDoc, getFirestore, runTransaction, serverTimestamp, setDoc } = require("@firebase/firestore");
const admin = require("firebase-admin");
const firebaseConfig = require("./firebase-config.json");

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
  databaseURL: process.env.DB_URL,
});


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

function sanityCheck(res, body, fields) {
  fields.forEach((field) => {
    if (!body[field]) {
      res.status(500).send({error: String(field) + " missing"});
      return true;
    }
  });
  return false;
}

const sexes = ["male", "female"]; 
// TODO: store in event, so that users can rename as they like

exports.new = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const body = req.body;
    if (sanityCheck(res, body, ["name", "time", "location", "description"])) {
      return;
    }
    if (new Date() > new Date(body.time)) {
      res.status(500).send("time must be in future");
      return;
    }
    try {
      const endTime = body.time; //body.endTime || new Date(new Date(body.time).getTime()+3600000);
      const e = {
        "name": body.name,
        "time": body.time,
        "location": body.location,
        "description": body.description
      };
      sexes.forEach((sex) => {
        ["Registered", "Invited"].forEach((stage) => {
          e[sex+stage] = {};
        });
      });
      if (body.user) {
        const user = body.user;
        const userCheck = sanityCheck(user, ["name", "email", "sex"]);
        if (userCheck) {
          res.status(500).send("malformed user data, aborting");
        }
        e[user.sex + "Registered"] = {
          "name" : user.name,
          "email" : user.email,
          "sex" : user.sex,
          "deadline" : user.deadline || endTime,
          "timestamp" : serverTimestamp(),
        }
      }
      const eventId = await addDoc(collection(db, "events"), e);
      res.status(201).send(eventId);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error submitting event" + error);
    }
  });
});

exports.event = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const body = req.body; // was req.body
    if (sanityCheck(res, body, ["id"])) {
      return;
    }
    try {
      const event = (await getDoc(doc(db, "events", body.id))).data();
      // TODO delete other unnecessary data
      if (!event) {
        res.status(404).send("event not found");
      }
      sexes.forEach((sex) => {
        ["Registered","Invited"].forEach((state) => {
          event[sex+state] = Object.keys(event[sex+state]).length;
        });
      });
      res.status(200).send(event);
    } catch (error) {
      console.error(error);
      // res.status(500).send({error: "error fetching event"});
      if (!res.headersSent) {
        res.status(500).send({error: "error fetching event"});
      }
      return; // I don't see how this will help
    }
  });
});