const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

mongoose.connect("mongodb://localhost:27017/zidprof")

const userShema = new Schema({
    email: String,
    tel: String,
    password: String,
    isAdmin: Boolean,
})

const jsonParser = express.json();

const User = mongoose.model("users", userShema);

let allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

app.use(allowCrossDomain);

app.post("/api/user", jsonParser, function(req,res) {
    let emailReq = req.body.email;
    let passwordReq = req.body.password;
    if(emailReq == "" || passwordReq == "") return res.send(false)
    User.findOne({email: emailReq}, function(err,data) {
        if(err) return console.log(err)
        if(data.email == "") return res.send(false);
        if(data.password == passwordReq){
            res.send(true)
        }
        else{
            res.send(false);
        }
    })
});

app.listen(5000);