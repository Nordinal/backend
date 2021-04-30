const express = require("express");
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

const jsonParser = express.json();

const User = mongoose.model("users", userShema);

let allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

app.use(allowCrossDomain);

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

app.listen(5000);