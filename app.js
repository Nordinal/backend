const express = require("express");
const app = express();

app.get("/", function(req,res) {
    res.send("<h2>Hello</h2>")
});

app.listen(5000);