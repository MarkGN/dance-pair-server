// const { doc, getDoc } = require("@firebase/firestore");
// const { getDoc } = require("firebase-admin/firestore");
const { cors, db, sanityCheck } = require("./utils")

const sexes = ["male", "female"];
// for the sake of leveraging the linter
const registered = "Registered";
const invited = "Invited";
const stages = [registered, invited];
const collection = db.collection("events");

async function getEvent (req, res) {
  cors(req, res, async () => {
    const body = req.body;
    if (sanityCheck(res, body, ["id"])) {
      return;
    }
    try {
      const request = await (collection.doc(body.id)).get();
      const event = request.data();
      if (!event) {
        res.status(404).send("event not found");
        return;
      }
      sexes.forEach((sex) => {
        stages.forEach((stage) => {
          event[sex+stage] = Object.keys(event[sex+stage]).length;
        });
      });
      const dataToSend = {
        name: event.name, 
        location: event.location, 
        time: event.time, 
        description: 
        event.description, 
        image: event.image, 
        numPairs: Math.min(sexes.map(sex => event[sex+invited]))};
      res.status(200).send(dataToSend);
    } catch (error) {
      console.error(error);
      if (!res.headersSent) {
        res.status(500).send({error: error});
      }
    }
  });
}

exports.getEvent = getEvent;