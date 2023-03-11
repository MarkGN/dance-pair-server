const {doc, runTransaction } = require("@firebase/firestore");
const {cors, db, sanityCheck} = require("./utils")

const registered = "Registered";
const invited = "Invited";

async function register (req, res) {
  cors(req, res, async () => {
    const body = req.body;
    if (sanityCheck(res, body, ["id", "name", "email", "sex"])) {
      return;
    }
    try {
      await runTransaction(db, async (t) => {
        const eventDocRef = doc(db, "events", body.id);
        const eventDoc = (await t.get(eventDocRef)).data();
        if (!eventDoc) {
          res.status(404).send({error: "event not found"});
          return
        }
        const oppositeSex = body.sex == "male" ? "female" : "male";
        const key1 = body.sex+registered;
        const key2 = oppositeSex+registered;
        const key3 = body.sex+invited;
        const key4 = oppositeSex+invited;
        const partners = eventDoc[key2];
        if (partners.length) {
          // invite
          // TODO send emails
          const partner = partners.shift();
          const inv1 = eventDoc[key3];
          inv1.push({name:body.name, email:body.email, sex:body.sex});
          const inv2 = eventDoc[key4];
          inv2.push(partner);
          const myUpdate = {};
          myUpdate[key2] = partners;
          myUpdate[key3] = inv1;
          myUpdate[key4] = inv2;
          t.update(eventDocRef, myUpdate);
        } else {
          // register
          const registrants = eventDoc[key1];
          registrants.push({name:body.name, email:body.email, sex:body.sex});
          const myUpdate = {};
          myUpdate[key1] = registrants;
          t.update(eventDocRef, myUpdate);
        }
      });
      console.log("Transaction successfully committed!");
    } catch (e) {
      console.log("Transaction failed: ", e);
      res.status(500).send("transaction failed");
    }
  });
}

exports.register = register;