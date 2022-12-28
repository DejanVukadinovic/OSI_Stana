'use strict'

const express = require("express")

const HOST = "0.0.0.0"
const PORT = 3000

let app = express()

app.get('/', (req, res)=>{
    res.send("Hello world!!")
})
app.listen(PORT, HOST);
console.log("Running on: http:127.0.0.1:3004")