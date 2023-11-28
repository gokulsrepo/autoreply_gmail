const { google } = require("googleapis");
const dotenv = require('dotenv');
dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

//Authorizing to the OAuth client using the credentials gathered in the project
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

//Creating a set object to add the already replied users
const repliedUsers = new Set();

//Check for new emails and sends replies .
async function checkAndSendMail() {
    try {
      const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
  
      // Get the list of unread messages.
      const res = await gmail.users.messages.list({
        userId: "me",
        q: "is:unread",
      });
      const messages = res.data.messages;
  
      if (messages && messages.length > 0) {
        // Fetch the complete message details.
        for (const message of messages) {
          const email = await gmail.users.messages.get({
            userId: "me",
            id: message.id,
          });
          
          const from = email.data.payload.headers.find(
            (header) => header.name === "From"
          );
          const toHeader = email.data.payload.headers.find(
            (header) => header.name === "To"
          );
          const Subject = email.data.payload.headers.find(
            (header) => header.name === "Subject"
          );

          if (from && toHeader && Subject) {
          //Gathering the from, to, subject details from the email
          const From = from.value;
          const toEmail = toHeader.value;
          const subject = Subject.value;
          console.log("Email came from", From);
          console.log("To Email", toEmail);

        //checking whether the user had been already replied
            if (repliedUsers.has(From)) {
                console.log("Already replied to : ", From);
                continue;
              }

        // Checking whether the email have any prior replies
          const thread = await gmail.users.threads.get({
            userId: "me",
            id: message.threadId,
          });
  
          //isolated the emails which have prior replies
          const replies = thread.data.messages.slice(1);
  
          if (replies.length === 0) {
            // if the email doesn't have any prior replies, then reply to the email.
            await gmail.users.messages.send({
              userId: "me",
              requestBody: {
                raw: await replyMessage(toEmail, From, subject),
              },
            });
  
            // Add a label to the email.
            const labelName = "AutoReplied";
            await gmail.users.messages.modify({
              userId: "me",
              id: message.id,
              requestBody: {
                addLabelIds: [await addLabel(labelName)],
              },
            });
  
            console.log("Sent reply to email:", From);
            //Add the user to replied users set
            repliedUsers.add(From);
          }
        }

        }
      }
    } catch (error) {
      console.error("Error occurred:", error);
    }
}



//Convert the message string to base64Encoded format
async function replyMessage(from, to, subject) {
  const emailContent = `From: ${from}\nTo: ${to}\nSubject: ${subject}\n\nThank you for your message. I am currently unavailable, will reach out you soon!`;
  const base64EncodedEmail = Buffer.from(emailContent)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return base64EncodedEmail;
}


//Adding a Label to the email and moving the email to the label
async function addLabel(labelName) {
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
  // Check if the label already exists.
  const res = await gmail.users.labels.list({ userId: "me" });
  const labels = res.data.labels;
  const existingLabel = labels.find((label) => label.name === labelName);
  if (existingLabel) {
    return existingLabel.id;
  }
  // Create the label if it doesn't exist.
const newLabel = await gmail.users.labels.create({
    userId: "me",
    requestBody: {
      name: labelName,
      labelListVisibility: "labelShow",
      messageListVisibility: "show",
    },
  });
  return newLabel.data.id;
}



//Automating the process in random intervals of 45 to 120 seconds
function getRandomInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function startAutoReply() {
setInterval(checkAndSendMail, getRandomInterval(45, 120) * 1000);
}
startAutoReply();

module.exports = { startAutoReply };

