const {doc, runTransaction } = require("@firebase/firestore");
const {sendEmail} = require("./email");
const {cors, db, sanityCheck} = require("./utils")

const registered = "Registered";
const invited = "Invited";


function registerEmailBody(name, details) {
  return "<html><body><p>Hello, "+name+",</p><p>You're now registered for "+
  "the event. We'll send a follow-up email with confirmation once we have a partner for you.</p>"+
  "<p>Event name: "+details.name+"</p>"+
  "<p>Time: "+details.time+
  "<p>Location: "+details.location+"</p>"+
  "<p>Description: "+details.description+"</p></body></html>";
}

function inviteEmailBody(name, partnerName, details) {
  return "<html><body><p>Hello, "+name+",</p><p>You just got invited to an event because "+partnerName+" registered. Don't back out now!</p>"+
  "<p>Event name: "+details.name+"</p>"+
  "<p>Time: "+details.time+
  "<p>Location: "+details.location+"</p>"+
  "<p>Description: "+details.description+"</p></body></html>";
}

async function register (req, res) {
  cors(req, res, async () => {
    const body = req.body;
    if (sanityCheck(res, body, ["id", "name", "email", "sex"])) {
      return;
    }
    try {
      let result = {};
      let partner;
      let updateData;
      let eventData;
      let shouldContinue = true;
      await db.runTransaction(async (t) => {
        const collection = db.collection("events");
        const eventDocRef = collection.doc(body.id);
        eventData = (await t.get(eventDocRef)).data();
        if (!eventData) {
          res.status(404).send({error: "event not found"});
          shouldContinue = false;
        }
        const oppositeSex = body.sex == "male" ? "female" : "male";
        const key1 = body.sex+registered;
        const key2 = oppositeSex+registered;
        const key3 = body.sex+invited;
        const key4 = oppositeSex+invited;
        const partners = eventData[key2];
        [key1, key2, key3, key4].some(key => {
          eventData[key].some(registrant => {
            if (registrant.email === body.email) {
              res.status(500).send({error: "You already registered."});
              shouldContinue = false;
            }
          })
        });
        if (shouldContinue) {
          if (partners.length) {
            // invite
            partner = partners.shift();
            const inv1 = eventData[key3];
            inv1.push({name:body.name, email:body.email, sex:body.sex});
            const inv2 = eventData[key4];
            inv2.push(partner);
            const myUpdate = {};
            myUpdate[key2] = partners;
            myUpdate[key3] = inv1;
            myUpdate[key4] = inv2;
            t.update(eventDocRef, myUpdate);
            result.invite = true;
            updateData = "invited";
          } else {
            // register
            const registrants = eventData[key1];
            registrants.push({name:body.name, email:body.email, sex:body.sex});
            const myUpdate = {};
            myUpdate[key1] = registrants;
            t.update(eventDocRef, myUpdate);
            result.register = true;
            updateData = "registered";
          }
        }
      });
      if (result.invite) {
        sendEmail("inviter@dance-pair.web.app", "Dance-pair inviter bot", body.email, inviteEmailBody(body.name, partner.name, eventData), "Event invitation");
        sendEmail("inviter@dance-pair.web.app", "Dance-pair inviter bot", partner.email, inviteEmailBody(partner.name, body.name, eventData), "Event invitation");
      }
      if (result.register) {
        sendEmail("inviter@dance-pair.web.app", "Dance-pair inviter bot", body.email, registerEmailBody(body.name, eventData), "Event registration");
      }
      res.status(200).send(updateData);
    } catch (e) {
      console.log("Transaction failed: ", e);
      if (!res.headersSent) {
        res.status(500).send("transaction failed: " + JSON.stringify(e));
      }
    }
  });
}

exports.register = register;