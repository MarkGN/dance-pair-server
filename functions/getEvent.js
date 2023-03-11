const { doc, getDoc } = require("@firebase/firestore");
const { cors, db, sanityCheck } = require("./utils")

const sexes = ["male", "female"];
// for the sake of leveraging the linter
const registered = "Registered";
const invited = "Invited";
const stages = [registered, invited];

async function getEvent (req, res) {
  console.log("alp")
  cors(req, res, async () => {
    const body = req.body;
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
        stages.forEach((stage) => {
          event[sex+stage] = Object.keys(event[sex+stage]).length;
        });
      });
      console.log("bet")
      res.set('Access-Control-Allow-Origin', 'http://localhost:3000'); // SHOULDN'T BE HERE
      res.status(200).send(event);
    } catch (error) {
      console.error(error);
      // res.status(500).send({error: "error fetching event"});
      if (!res.headersSent) {
        res.status(500).send({error: "error fetching event"});
      }
    }
  });
}

exports.getEvent = getEvent;