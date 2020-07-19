const {google}=require("googleapis");
const MESSAGING_SCOPE="https://www.googleapis.com/auth/firebase.messaging";
const SCOPES=[MESSAGING_SCOPE];

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

function sendNotification(message, apiVersion=0, access_token=''){
    return new Promise((resolve, reject) => {
        let Headers, URL;

        if(apiVersion === 1){
            Headers = {
                "Content-Type": "application/json",
                "Authorization": "Bearer "+ access_token
            };
            URL = "https://fcm.googleapis.com/v1/projects/pushnotification-f3008/messages:send";
        }else{
            Headers = {
                "Content-Type": "application/json",
                "Authorization": "key="+process.env.FCM_API_KEY
            };
            URL = "https://fcm.googleapis.com/fcm/send";
        }

        request.post({
            headers: Headers,
            url: URL,
            body: JSON.stringify(message)
        }, function (error, response, body) {
            resolve(body);
        });
    });
}

function getAccessToken(){
    return new Promise(function(resolve,reject){
        const jwtClient=new google.auth.JWT(
            process.env.FCM_CLIENT_EMAIL,
            null,
            process.env.FCM_PRIVATE_KEY,
            SCOPES,
            null
        )
        jwtClient.authorize(function(err,tokens){
            if(err){
                reject(err)
                return
            }
            resolve(tokens.access_token)
        })
    })
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
    sendNotification(message, 0, '').then(
        success => {
            return res.json({"Error": false, "Response": success});
        }
    );
    
});


router.post("/pushNotification/v1", (req, res) => {
    const token = req.body.token;
    const type = req.body.type;
    let message;

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
    getAccessToken().then(
        token => {
            sendNotification(message, 1, token).then(
                success => {
                    return res.json({"Error": false, "Response": success});
                }
            );
        }, err => {
            console.log(err);
            return res.json({"Error": false, "Response": "Something Went Wrong"});
        }
    );
});


app.use("/api", router);

app.listen(port, () => {
    console.log("listening to port => " + port)
});