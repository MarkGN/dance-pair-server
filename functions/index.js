require("dotenv").config();
const functions = require("firebase-functions");
const {getEvent} = require("./getEvent");
const {newEvent} = require("./newEvent");
const {register} = require("./register");

exports.getEvent = functions.https.onRequest(getEvent);
exports.newEvent = functions.https.onRequest(newEvent);
exports.register = functions.https.onRequest(register);

// const alice = {name: 'alice', email: 'alice@gmail.com', sex: 'female', id: 'VQgL2hcaRZjjBZc0XGIJ'};
// const bob = {name: 'bob', email: 'bob@gmail.com', sex: 'male', id: 'VQgL2hcaRZjjBZc0XGIJ'};
// const charlie = {name: 'charlie', email: 'charlie@gmail.com', sex: 'male', id: 'VQgL2hcaRZjjBZc0XGIJ'};
// const dave = {name: 'dave', email: 'dave@gmail.com', sex: 'male', id: 'VQgL2hcaRZjjBZc0XGIJ'};
// const eve = {name: 'eve', email: 'eve@gmail.com', sex: 'female', id: 'VQgL2hcaRZjjBZc0XGIJ'};