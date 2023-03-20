const { addDoc, collection } = require("@firebase/firestore");
const {cors, db, sanityCheck} = require("./utils")

const sexes = ["male", "female"];
// for the sake of leveraging the linter
const registered = "Registered";
const invited = "Invited";
const stages = [registered, invited];
// TODO: store in event, so that users can rename as they like

async function newEvent(req, res) {
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
        stages.forEach((stage) => {
          e[sex+stage] = [];
        });
      });
      if (body.user) {
        const user = body.user;
        const userCheck = sanityCheck(user, ["name", "email", "sex"]);
        if (userCheck) {
          res.status(500).send("malformed user data, aborting");
        }
        e[user.sex + registered] = [{
          "name" : user.name,
          "email" : user.email,
          "sex" : user.sex,
          "deadline" : user.deadline || endTime,
          "timestamp" : serverTimestamp(),
        }]
      }
      const eventId = await addDoc(collection(db, "events"), e);
      res.status(201).send(eventId.id);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error submitting event" + error);
    }
  });
};

exports.newEvent = newEvent;