const {google}=require("googleapis")
const MESSAGING_SCOPE="https://www.googleapis.com/auth/firebase.messaging"
const SCOPES=[MESSAGING_SCOPE]

const express=require("express")
const app=express()

const bodyParser=require("body-parser")
const router=express.Router()
const request=require("request")

const port=8080

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

router.post("/pushnotification",(req,res)=>{

    getAccessToken().then(function(access_token){
        const title=req.body.title
        const body=req.body.body
        const token=req.body.token
        const key1=req.body.key1
        const key2=req.body.key2


        request.post({
            headers:{
                Authorization:"Bearer "+ access_token
            },
            url:"https://fcm.googleapis.com/v1/projects/pushnotification-f3008/messages:send",
            body:JSON.stringify(
                {
                    
                        "message":{
                          "token":token,
                          "notification":{
                            "title":title,
                            "body":body
                          },
                          "data":{
                            "key1" : key1,
                            "key2" : key2
                            
                          }
                        }
                      
               }

            )
        },function(error,response,body){
                res.send(body)
                console.log(body)
        })

    })
 })


app.use("/api",router)
app.listen(port,()=>{
    console.log("listening to port" + port)
})

function getAccessToken(){
    return new Promise(function(resolve,reject){
        const key=require("./service-account.json")
        const jwtClient=new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
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

getAccessToken().then(function(access_token){
    console.log(access_token)
})