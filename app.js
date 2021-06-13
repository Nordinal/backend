const express = require("express");
const fs = require("fs")
const app = express();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const validator = require('validator')

mongoose.connect("mongodb+srv://zidprof:gbhfvblf30061998@cluster0.buew0.mongodb.net/zidprof?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })

const userShema = new Schema({
    email: String,
    tel: String,
    password: String,
    isAdmin: Boolean,
    tests: Array,
}) 
const tagShema = new Schema({
    tag: String,
    like: Number
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
    res.header('Access-Control-Allow-Origin', "http://localhost:3000");
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
app.post("/api/deleterequest", jsonParser, async function(req, res){
    try{
        console.log(req.body)
        await Message.deleteOne({_id: req.body.id});
        res.json(true);
    }
    catch(e){
        console.log(e);
        res.json(false);
    }
})

app.post("/api/user", jsonParser, async function(req,res) {
    try{
        let {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user) return res.send(false);
        const cryptPass = await bcrypt.compare(password, user.password);
        if(cryptPass){
            res.json({
                email: user.email,
                tel: user.tel,
                id: user._id
            });
        }
        else{
            res.send(false);
        }
    }
    catch(e){
        console.log(e);
        res.json(false);
    }
});
app.post("/api/usercookie", jsonParser, async function(req,res) {
    try{
        const user = await User.findOne({_id: req.body.id});
        if(!user) {
            res.send(false);
        }
        else{
            res.json({
                email: user.email,
                tel: user.tel,
                id: user._id
            });
        }
    }
    catch(e){
        console.log(e);
        res.json(false);
    }
});
app.post("/api/changeuser", jsonParser, async function(req, res){
    try{
        const {tel, passOld, passNew, passNewRepeat, id} = req.body
        console.log(req.body);
        if(req.body.passOld != ''){
            if(passNew == passNewRepeat && passNew != "" && passNew.length > 8){
                const user = await User.findOne({_id: id});
                if(!user) return res.send({isFine: false});
                const cryptPass = await bcrypt.compare(passOld, user.password);
                if(cryptPass){
                    const cryptPassNew = await bcrypt.hash(passNew, 4);
                    User.updateOne({_id: id}, {$set: {password: cryptPassNew}}).then((result) =>{
                        console.log(result)
                        res.json({
                            tel: user.tel,
                            isFine: true,
                        });
                    })
                }
                else{
                    res.json({errorMessage: "Старый пароль не совпадает", isFine: false})
                }
            }
            else{
                res.json({errorMessage: "Пароли не совпадают или длина меньше 8 символов", isFine: false})
            }
        }
        else{
            console.log(id);
            const user = await User.findOne({_id: id});
            if(!user) return res.json({isFine: false});
            User.updateOne({_id: id}, {$set: {tel: tel}}).then((result) =>{
                res.json({
                    tel: user.tel,
                    isFine: true,
                });
            })

        }
    }
    catch(e){
        console.log(e);
        res.json({errorMessage: "Ошибка на стороне сервера", isFine: false});
    }
})
app.post("/api/isadmin", jsonParser, async function(req,res) {
    try{
       const user = await User.findOne({_id: req.body.id});
       if(!user) {
           res.json(false);
       }
       else{
            if(user.isAdmin) {
                res.json(true);
            }else{
                res.json(false);
            }
       }
    }
    catch(e){
        console.log(e);
        res.json(false);
    }
});
app.post("/api/reg", jsonParser, async function(req,res) {
    try{
       const {email, pass, tel} = req.body;
       if(!validator.isEmail(email)){
           res.json({message: "Неверный email"})
       }
       else{
            const curUser = await User.findOne({email});
            if(curUser){
                res.json({message: "Пользователь с таким email уже существует"})
            }
            else{
                const cryptPass = await bcrypt.hash(pass, 4);
                const result = await User.insertMany({email, tel, password: cryptPass, isAdmin: false, tests: [0, 0]});
                const user = await User.findOne({email});
                if(result){
                    res.json({
                        email: user.email,
                        tel: user.tel,
                        id: user._id
                    });
                }
            }
       }
    }
    catch(e){
        console.log(e);
        res.json(false);
    }
});
app.get("/api/tag", jsonParser, async function(req, res) {
    try{
        const tags = await Tags.find();
        res.json(tags);
    }
    catch(e){
        console.log(e);
    }
})
app.post("/api/liketag", jsonParser, async function(req, res){
    try{
        const id = req.body.id;
        Tags.updateOne({_id: req.body.id}, {$inc: {like: 1}}).then(() => {
            res.json(true);
        })
    }
    catch(e){
        console.log(e);
        res.json(false);
    }
})
app.post("/api/unliketag", jsonParser, async function(req, res){
    try{
        const id = req.body.id;
        Tags.updateOne({_id: req.body.id}, {$inc: {like: -1}}).then(() => {
            res.json(true);
        })
    }
    catch(e){
        console.log(e);
        res.json(false);
    }
})

app.get("/api/about", jsonParser, async function(req, res) {
    try{
        const about = await AboutUs.find();
        res.json(about);
    }
    catch(e){
        console.log(e);
        res.json(false);
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