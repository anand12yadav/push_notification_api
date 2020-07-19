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
            "Content-Type": "application-json",
            "Authorization": "key="+process.env.FCM_API_KEY
        };
    
        const URL = "https://fcm.googleapis.com/v1/projects/pushnotification-f3008/messages:send";

        request.post({
            headers: Headers,
            url: URL,
            body: JSON.stringify(message)
        }, function (error, response, body) {
            if(error){
                return reject(error);
            }else{
                return resolve(body);
            }
        });
    });
}

router.post("/pushNotification", (req, res) => {
    const token = req.body.token;
    const type = req.body.type;
    const message;

    if(type === 'notification'){
        message = {
            "message": {
                "token": token,
                "notification": notification
            }
        };
    } else if(type === 'data'){
        message = {
            "message": {
                "token": token,
                "data": data
            }
        };
    } else{
        message = {
            "message": {
                "token": token,
                "notification": notification,
                "data": data
            }
        };   
    }
    sendNotification.then(
        success => {
            return res.json({"Error": false, "Response": JSON.stringify(success)});
        }, error => {
            return res.json({"Error": true, "Response": "Something Went Wrong"});
        }
    )
    
});


app.use("/api", router);

app.listen(port, () => {
    console.log("listening to port" + port)
});