'use strict'

const express = require("express")
const mysql = require("mysql2")

const HOST = "0.0.0.0"
const PORT = 3000

let con = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

let app = express()

app.get('/', (req, res)=>{
    res.send("Hello world!!")
})
app.listen(PORT, HOST);
console.log("Running on: http:127.0.0.1:3004")