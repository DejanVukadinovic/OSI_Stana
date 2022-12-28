'use strict'

const express = require("express")

const PORT = 3000
const HOST = '0.0.0.0'

let app = express()

app.get('/', (req, res)=>{
    res.send("Hello world")
})
app.listen(PORT, HOST)
console.log("Running on: http://127.0.0.0:3005")