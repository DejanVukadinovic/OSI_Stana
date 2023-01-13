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
const cors = require("cors")
var crypto = require('crypto');
const e = require("express");

const PORT = 3000;
const HOST = '0.0.0.0'

let con = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

const jsonParser = bodyParser.json()

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
function authenticateAdmin(req, res, next) {
    con.connect(async function(err){
        if(err) throw err;
        const [typeRes] = await con.promise().query("SELECT user_type FROM user WHERE username = ?", [req.user.user])
        if(typeRes[0]){res.send(403)}
        next()
    })
  }

const app = express()
app.use(cors())
app.get('/', (req, res)=>{
    res.send("Hello world!!")
})
app.get('/login', jsonParser, (req, res)=>{
    con.connect(async function(err) {
        
        if(err) throw err;
        const [userRes] = await con.promise().query("SELECT * FROM user WHERE username = ?", [req.body.username])
        const hash = crypto.createHash('sha256').update(req.body.password).digest('hex');
        if(!userRes[0]){
            res.send(400, {err:"User non existant"})
        }
        else if(userRes[0].password==hash){
            const resp = {
                name:userRes[0].name,
                login:true,
                token: jwt.sign({username:userRes[0].username}, process.env.JWT_KEY),
                user_type:userRes[0].user_type
            }
            res.send(200, resp)
        }else{
            res.send(403, {err:"Wrong password"})
        }
    })
})

app.get('/list', jsonParser, authenticateToken, authenticateAdmin, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        const [userRes] = await con.promise().query("SELECT * FROM user")
        const mappedRes = userRes.map(element=>{
            let type;
            if(element.user_type==0)type="admin"
            else if(element.user_type==1)type="driver"
            else if(element.user_type==2)type="passenger"
            else type="unsuported"
            return{
                iduser:element.iduser,
                name:element.name,
                username:element.username,
                user_type:type
            }
        })
        console.log(mappedRes)
        res.send(200, mappedRes)
    })
})

app.listen(PORT, HOST);
console.log(`Running on: http://${HOST}:3003`)