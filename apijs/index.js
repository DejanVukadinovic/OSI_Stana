'use strict'

//require('dotenv').config()
const express = require("express");
const mysql = require("mysql2")
const jwt = require("jsonwebtoken")
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const Mustache = require('mustache');
const bodyParser = require('body-parser')

const PORT = 3000;
const HOST = '0.0.0.0'

let con = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

const jsonParser = bodyParser.json()

const generation = {
	html: 'index.html',
};

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
  
    if (token == null) return res.send(req.headers)
  
    jwt.verify(token, process.env.JWT_KEY, (err, user) => {
      console.log(err)
  
      if (err) return res.send(token, 403)
  
      req.user = user
  
      next()
    })
  }

const app = express()
app.get('/', (req, res)=>{
    res.send("Hello world!!")
})
app.post('/ticket/create', jsonParser, authenticateToken, (req, res)=>{
    con.connect(async function(err) {
        res.send(200, req.body)
    })
    //res.send("CREATING TICKET")
})

app.get("/tickets", authenticateToken, (req, res)=>{
    con.connect( async function(err){
        if(err) {res.send(500);throw err};
        const [tickets] = await con.promise().query("SELECT ticket.idticket, route_has_ticket.idroute FROM ticket NATURAL JOIN passenger NATURAL JOIN user NATUAL JOIN route_has_ticket where username = ?", [req.user.user])
        res.send(tickets)
    })
})

app.use('/pdf', express.static(__dirname + '/tickets'));
app.listen(PORT, HOST);
console.log(`Running on: http://${HOST}:3003`)