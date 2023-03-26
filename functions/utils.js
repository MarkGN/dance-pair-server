require("dotenv").config();
const cors = require('cors')({origin: true});
// const cors = require('cors')({origin: ['https://example.com', 'https://www.example.com']});
// ... to make it only accept from, say, my front-end
// const { initializeApp } = require("@firebase/app");
const firebaseConfig = require("./firebase-config.json");
// const app = initializeApp(firebaseConfig);
// const { getFirestore } = require("@firebase/firestore");
// const db = getFirestore(app);
const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
  databaseURL: process.env.DB_URL,
});
const db = admin.firestore();

exports.cors = (req, res, next) => {
  cors(req, res, () => {
    next();
  });
};

exports.db = db;

exports.sanityCheck = function sanityCheck(res, body, fields) {
  fields.forEach((field) => {
    if (!body[field]) {
      res.status(570).send({error: String(field) + " missing"});
      return true;
    }
  });
  return false;
};