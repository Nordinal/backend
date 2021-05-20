const express = require("express");
const fs = require("fs")
const app = express();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

mongoose.connect("mongodb://localhost:27017/zidprof", { useNewUrlParser: true, useUnifiedTopology: true })

const userShema = new Schema({
    email: String,
    tel: String,
    password: String,
    isAdmin: Boolean,
})
const tagShema = new Schema({
    tag: Array
})
const aboutUsShema = new Schema({
    name: String,
    desc: String,
    descImg: String,
    nameUrl: String,
    url: String,
    image: String
})
const messageSchema = new Schema({
    name: String,
    tel: String,
    message: String,
    status: Boolean,
})

const jsonParser = express.json();

const User = mongoose.model("users", userShema);
const Tags = mongoose.model("tags", tagShema);
const AboutUs = mongoose.model("about", aboutUsShema);
const Message = mongoose.model("messages", messageSchema);

let allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

app.use(allowCrossDomain);

app.post("/api/message", jsonParser, async function(req,res) {
    try{
        const {name, tel, message} = req.body
        const newMessage = await Message.insertMany({name, tel, message, status: false})
        res.json(true);
    }
    catch(e){
        console.log(e)
        res.json(false);
    }
})
app.get("/api/request", jsonParser, async function(req,res){
    try{
        const message = await Message.find();
        res.json(message);
    }
    catch(e){
        console.log(e);
        res.json(false);
    }
})
app.post("/api/updatestatusrequest", jsonParser, async function(req,res){
    try{
        await Message.updateOne({_id: req.body.id}, {$set: {status: true}})
        res.json(true);
    }
    catch(e){
        console.log(e);
        res.json(false);
    }
})
app.delete("/api/deleterequest", jsonParser, async function(req, res){
    try{
        await Message.deleteOne({_id: req.body.id});
    }
    catch(e){
        console.log(e);
    }
})

app.post("/api/user", jsonParser, async function(req,res) {
    try{
        let {email, password} = req.body;
        const user = await User.findOne({email})
        if(!user) return res.send(false);
        if(user.password == password){
            res.json({
                email: user.email,
                password: user.password,
                tel: user.tel
            });
        }
        else{
            res.send(false);
        }
    }
    catch(e){
        console.log(e);
    }
});

app.get("/api/tag", jsonParser, async function(req, res) {
    try{
        const tags = await Tags.find()
        res.json(tags[0]);
    }
    catch(e){
        console.log(e);
    }
})
app.get("/api/about", jsonParser, async function(req, res) {
    try{
        const about = await AboutUs.find();
        res.json(about);
    }
    catch(e){
        console.log(e);
    }
})

app.get("/api/public/:id", async function(req, res){
    try{
        let file = fs.readFileSync(__dirname + "/public/" + req.params["id"]);
        if(!!file){
            res.write(file);
        }
    }
    catch(e){
        console.log(e);
    }
    res.end();
})
app.listen(5000);