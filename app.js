const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const router = express.Router();
const request = require("request");

const dotenv = require('dotenv');
const port = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
dotenv.config();

const notification = {
    title: "A Push Notification Test",
    body: "A Test Body"
};

const data = {
    key1: "value1",
    key2: "value2"
};

function sendNotification(message){
    return new Promise((resolve, reject) => {
        const Headers = {
            "Content-Type": "application/json",
            "Authorization": "key="+process.env.FCM_API_KEY
        };
    
        // const URL = "https://fcm.googleapis.com/v1/projects/pushnotification-f3008/messages:send";

        const URL = "https://fcm.googleapis.com/fcm/send";

        request.post({
            headers: Headers,
            url: URL,
            body: JSON.stringify(message)
        }, function (error, response, body) {
            resolve(body);
        });
    });
}

router.post("/pushNotification", (req, res) => {
    const token = req.body.token;
    const type = req.body.type;
    let message;

    if(type === 'notification'){
        message = {
            "to": token,
            "notification": notification
        };
    } else if(type === 'data'){
        message = {
            "to": token,
            "data": data
        };
    } else{
        message = {
            "to": token,
            "notification": notification,
            "data": data
        };   
    }
    sendNotification(message).then(
        success => {
            return res.json({"Error": false, "Response": success});
        }
    )
    
});


app.use("/api", router);

app.listen(port, () => {
    console.log("listening to port" + port)
});