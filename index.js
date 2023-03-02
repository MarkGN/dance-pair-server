const dotenv = require("dotenv");
dotenv.config();
// const cors = require('cors')({origin: true});
const express = require('express');
const app = express();
const nodemailer = require("nodemailer");
const path = require("path");

const firebaseConfig = require('./firebase-config.json');
const { initializeApp } = require('firebase-admin/app');
const { signInWithEmailAndPassword, getAuth } = require("firebase/auth");
const { doc, getFirestore, setDoc } = require("firebase/firestore");


const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
  databaseURL: 'https://dance-pair.firebaseio.com',
}); // maybe add australia-east-1 or something?

const db = admin.firestore();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PW
  }
});
transporter.sendMail({from:"server",to:process.env.EMAIL,subject:"test email", html:"<p>test</p>"});
// const c = cors(req, res, ()=> {
//   transporter.sendMail({from:"server",to:process.env.EMAIL,subject:"test email", html:"<p>test</p>"}, (err,info) => {
//     console.log(err);
//     console.log(info);
//   })
// });
// console.log(c);
// console.log(typeof(c));

// Handler for POST request to /events
app.post('/events', async (req, res) => {
  try {
    await setDoc(doc(db, "events", 23), {"one": 1, "two":2});
    // const eventData = req.body; // Assuming data is sent as JSON in the request body
    // const db = admin.firestore();
    // await db.collection('events').add(eventData); // Add the data to the 'events' collection in Firestore
    res.sendStatus(201); // Send a success status code
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Send an error status code
  }
});

app.post("/register", async (req, res) => {
  try {
    const name = req.name;
    const email = req.email;
    const sex = req.sex;
    if (name && email && sex) {
      await setDoc(doc(db, "events", req.params.eventId), {name:name});
      res.sendStatus(201)
    } else {
      res.sendStatus(400);
      res.send("<div>Name, email, and sex must all be supplied.</div>")
    }
    await setDoc(doc(db, "events", ), )
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
})

app.get('/hello', async (req, res) => {
  res.send('Hello, World! Adding page because why not!');
  // await setDoc(doc(db, "events", 23), {"one": 1, "two":2});
  // db.collection('events').add({"one": 1, "two":2});
  // console.log((await db.collection('events').doc("NuQwxezamT6OpT1tOTG6").get()).data());
  const query = db.collection("events").where("one", "==", 1);
  const result = await query.get();
  result.forEach(r => {
    console.log(r.id, r.data())
  });
  console.log(result);
  console.log("done")
});

app.get('/test', async (req, res) => {
  res.send('Tests!');
});

app.get('/params/:id', async (req, res) => {
  res.send(req.params.id);
});

// NuQwxezamT6OpT1tOTG6
app.get('/events/:eventId', async (req, res) => {
  const eventId = req.params.eventId;
  // res.send("basic");

  try {
    console.log(admin.firestore().collection('events'))
    const eventRef = admin.firestore().collection('events').doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      res.status(404).send('Event not found');
    } else {
      res.send(eventDoc.data());
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});