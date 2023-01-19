'use strict'

//require('dotenv').config()
const express = require("express");
const mysql = require("mysql2")
const jwt = require("jsonwebtoken")
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const Mustache = require('mustache');
const cors = require("cors")
var crypto = require('crypto');
const {LOGIN_LIMIT}=require('./params')
const PORT = 3000;
const HOST = '0.0.0.0'
const bodyParser = require("body-parser")

const jsonParser = bodyParser.json();

let con = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

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
app.use(bodyParser.json())
app.get('/', (req, res)=>{
    res.send("Hello world!!")
})
app.put('/login', jsonParser, (req, res)=>{
    con.connect(async function(err) {
        console.log(req.body)
        if(err) throw err;
        if(!req.body.username){
            res.send(400,{err:"You must enter a username."})
            return
        }
        else if(!req.body.password){
            res.send(400,{err:"You must enter a password."})
            return
        }
        const [userRes] = await con.promise().query("SELECT * FROM user WHERE username = ?", [req.body.username])
        const hash = crypto.createHash('sha256').update(req.body.password).digest('hex');
        if(!userRes[0]){
            res.send(400, {err:"User does not exist."})
        }
        else if(userRes[0].password==hash){
            if(userRes[0].deleted==1){
                await con.promise().query("UPDATE user SET deleted=? WHERE user.username=?",[1,req.body.username])
            }
            let password_change=userRes[0].login_num<LOGIN_LIMIT?false:true;
            if(password_change){

                await con.promise().query("UPDATE user SET login_num=? WHERE user.username=?",[++userRes[0].login_num,req.body.username])  
            }
            const resp = {
                name:userRes[0].name,
                login:true,
                password_change,
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
        const [driverRes] = await con.promise().query("SELECT * FROM driver")
        const [passengerRes] = await con.promise().query("SELECT * FROM passenger")
        let mappedRes = userRes.filter(el=>!el.deleted)
        mappedRes = mappedRes.map(element=>{
            let user_type = "unsuported";
            let suspended = "not possible to suspend";
            if(element.user_type==0)user_type="admin"
            else if(element.user_type==1){
                user_type="driver"
                const driver = driverRes.find(driver => driver.iduser === element.iduser);
                if (driver) suspended = driver.suspended;
            }
            else if(element.user_type==2){
                user_type="passenger"
                const passenger = passengerRes.find(passenger => passenger.iduser === element.iduser);
                if (passenger) suspended = passenger.suspended;
            }
            return{
                iduser:element.iduser,
                name:element.name,
                username:element.username,
                user_type:user_type,
                suspended:suspended
            }
        })
        console.log(mappedRes)
        res.send(200,mappedRes)
    })
})

app.get('/list/drivers', jsonParser, authenticateToken, authenticateAdmin, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        const [userRes]=await con.promise().query("SELECT * FROM driver NATURAL JOIN user")
        let mappedRes = userRes.filter(el=>!el.deleted)
        mappedRes = mappedRes.map(element=>{
            
            let suspended = true;
            if(element.suspended==0)suspended=false;
            return{
                iddriver:element.iddriver,
                name:element.name,
                username:element.username,
                suspended,
                user_type:"driver"
            }
        })
        
        console.log(mappedRes)
        res.send(200, mappedRes)
    })
})

app.get('/list/passengers', jsonParser, authenticateToken, authenticateAdmin, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        console.log(req.body)
        const [userRes]=await con.promise().query("SELECT * FROM passenger NATURAL JOIN user")
        let mappedRes = userRes.filter(el=>!el.deleted)
        mappedRes = mappedRes.map(element=>{
            
            let suspended = true;
            if(element.suspended==0)suspended=false;
            return{
                idpassenger:element.idpassenger,
                name:element.name,
                username:element.username,
                suspended,
                user_type:"passenger"
            }
        })
        
        console.log(mappedRes)
        res.send(200, mappedRes)
    })
})

app.post('/register', jsonParser, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        console.log(req.body)
        if(!req.body.username){
            res.send(400,{err:"You must enter a username."})
            return
        }
        else if(!req.body.password){
            res.send(400,{err:"You must enter a password."})
            return
        }
        else if(!req.body.name){
            res.send(400,{err:"You must enter a name."})
            return
        }
        else if(!req.body.user_type){
            res.send(400,{err:"You must enter a user type."})
            return
        }
        const [userRes] = await con.promise().query("SELECT username FROM user WHERE username=?",[req.body.username])
        if(userRes[0]){
            res.send(400, {err:"Username already exists."})
            return
        }
        console.log(req.body)
        let user_type;
        if(req.body.user_type=="admin")user_type=0
        else if(req.body.user_type=="driver")user_type=1
        else if(req.body.user_type=="passenger")user_type=2
        const hash = crypto.createHash('sha256').update(req.body.password).digest('hex');
        await con.promise().query("INSERT INTO user(username,password,login_num,name,deleted,user_type) VALUES(?,?,?,?,?,?)",[req.body.username,hash,0,req.body.name,0,user_type])
        const [pomRes] = await con.promise().query("SELECT * FROM user WHERE username=?",[req.body.username])
        if(req.body.user_type=="driver"){
            await con.promise().query("INSERT INTO driver(iduser,suspended) VALUES(?,?)",[pomRes[0].iduser,0])
         }
         if(req.body.user_type=="passenger"){
            await con.promise().query("INSERT INTO passenger(iduser,suspended) VALUES(?,?)",[pomRes[0].iduser,0])
         }
         console.log(req.body)
        res.send(200, {message:"Account registerd."})
    })
})


app.put('/suspend', jsonParser, authenticateToken, authenticateAdmin,  (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        console.log(req.body)
        if(!req.body.username){
            res.send(400,{err:"You must enter a username."})
            return
        }
        const [tmpRes] = await con.promise().query("SELECT * FROM user WHERE username=?",[req.body.username])
        if(!tmpRes[0]){
            res.send(400, {err:"Username does not exist."})
            return
        }
        if(tmpRes[0].user_type==0){
            res.send(400,{err:"Unable to suspend account."})
            return 
        }
        else if(tmpRes[0].user_type==1){
        await con.promise().query("UPDATE driver SET suspended=? WHERE driver.iduser=?",[1,tmpRes[0].iduser])
        }
        else if(tmpRes[0].user_type==2){
            await con.promise().query("UPDATE passenger SET suspended=? WHERE passenger.iduser=?",[1,tmpRes[0].iduser])
            }
        res.send(200, {message:"Account suspended."})
    })
})

app.put('/activate', jsonParser, authenticateToken, authenticateAdmin,  (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        console.log(req.body)
        if(!req.body.username){
            res.send(400,{err:"You must enter a username."})
            return
        }
        const [tmpRes] = await con.promise().query("SELECT * FROM user WHERE username=?",[req.body.username])
        if(!tmpRes[0]){
            res.send(400, {err:"Username does not exist."})
            return
        }
        if(tmpRes[0].user_type==0){
            res.send(400,{err:"Unable to activate account."})
            return 
        }
        else if(tmpRes[0].user_type==1){
        await con.promise().query("UPDATE driver SET suspended=? WHERE driver.iduser=?",[0,tmpRes[0].iduser])
        }
        else if(tmpRes[0].user_type==2){
            await con.promise().query("UPDATE passenger SET suspended=? WHERE passenger.iduser=?",[0,tmpRes[0].iduser])
            }
        res.send(200, {message:"Account activated."})
    })
})

app.get('/driver/details', jsonParser, authenticateToken, authenticateAdmin, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        console.log(req.body)
        if(!req.body.username){
            res.send(400,{err:"You must enter a username."})
            return
        }

        const [userRes]=await con.promise().query("SELECT * FROM driver NATURAL JOIN user WHERE username=?",[req.body.username])
        if(!userRes[0]){
            res.send(400, {err:"Driver with this username does not exist."})
            return
        }
        if(!userRes[0].deleted){
             const sendRes={iddriver:userRes[0].iddriver,name:userRes[0].name,username:userRes[0].username,suspended:userRes[0].suspended}
             res.send(200,sendRes)
             return
        }
        else{
            res.send(400, {err:"Driver is deleted."})
            return
        }

        })
        
})

app.get('/passenger/details', jsonParser, authenticateToken, authenticateAdmin, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        console.log(req.body)
        if(!req.body.username){
            res.send(400,{err:"You must enter a username."})
            return
        }

        const [userRes]=await con.promise().query("SELECT * FROM passenger NATURAL JOIN user WHERE username=?",[req.body.username])
        if(!userRes[0]){
            res.send(400, {err:"Passenger with this username does not exist."})
            return
        }
        if(!userRes[0].deleted){
             const sendRes={idpassenger:userRes[0].idpassenger,name:userRes[0].name,username:userRes[0].username,suspended:userRes[0].suspended}
             res.send(200,sendRes)
             return
        }
        else{
            res.send(400, {err:"Passenger is deleted."})
            return
        }

        })
        
})


app.put('/delete', jsonParser, authenticateToken,  (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        console.log(req.body)
        if(!req.body.username){
            res.send(400,{err:"You must enter a username."})
            return
        }
        const [tmpRes] = await con.promise().query("SELECT * FROM user WHERE username=?",[req.body.username])
        if(!tmpRes[0]){
            res.send(400, {err:"Username does not exist."})
            return
        }
        await con.promise().query("UPDATE user SET deleted=? WHERE user.username=?",[1,req.body.username])
        res.send(200, {message:"Account deleted."})
    })
})

app.put('/edit/profile', jsonParser, authenticateToken,  (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        console.log(req.body)
        if(!req.body.username){
            res.send(400,{err:"You must enter a username."})
            return
        }
        else if(!req.body.new_name){
            res.send(400,{err:"You must enter a new name."})
            return
        }
        const [tmpRes] = await con.promise().query("SELECT * FROM user WHERE username=?",[req.body.username])
        if(!tmpRes[0]){
            res.send(400, {err:"Username does not exist."})
            return
        }
        await con.promise().query("UPDATE user SET name=? WHERE user.username=?",[req.body.new_name,req.body.username])
        console.log(req.body)
        res.send(200, {message:"Profile edited."})
    })
})

app.put('/password', jsonParser, authenticateToken,  (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        console.log(req.body)
        if(!req.body.username){
            res.send(400,{err:"You must enter a username."})
            return
        }
        else if(!req.body.old_password){
            res.send(400,{err:"You must enter the old password."})
            return
        }
        else if(!req.body.new_password){
            res.send(400,{err:"You must enter the new password."})
            return
        }
        const [tmpRes] = await con.promise().query("SELECT * FROM user WHERE username=?",[req.body.username])
        const hash_old=crypto.createHash('sha256').update(req.body.old_password).digest('hex')
        if(!tmpRes[0]){
            res.send(400, {err:"Username does not exist."})
            return
        }
        else if(tmpRes[0].password!=hash_old){
            res.send(400, {err:"Old password is incorrect."})
            return
        }
        if(req.body.old_password==req.body.new_password){
            res.send(400, {err:"The old and the new passwords are the same. Please enter new password."})
            return
        }
        const hash = crypto.createHash('sha256').update(req.body.new_password).digest('hex')
        await con.promise().query("UPDATE user SET password=? WHERE user.username=?",[hash,req.body.username])
        console.log(req.body)
        res.send(200, {message:"Password changed."})
    })
})

app.get('/available_drivers', jsonParser, authenticateToken, authenticateAdmin, (req, res) => {
    con.connect(async function(err) {
        if (err) throw err;
        if (!req.body.time) {
            res.status(400).json({ err: "You must enter time!" });
            return;
        } else if (!req.body.duration) {
            res.status(400).json({ err: "You must enter duration!" });
            return;
        }
        let availableDrivers = new Set();
        
        const [routeRes] = await con.promise().query("SELECT route_has_driver.idroute, iddriver FROM route_has_driver INNER JOIN route ON route_has_driver.idroute = route.idroute WHERE route.time = ?", [req.body.time]);
    
        let unavailableDrivers = [];
        routeRes.forEach((route) => {
            unavailableDrivers.push(route.iddriver);
        });

        const [routeRes2] = await con.promise().query("SELECT route_has_driver.idroute, iddriver FROM route_has_driver INNER JOIN route ON route_has_driver.idroute = route.idroute WHERE DATE_ADD(route.time, INTERVAL route.duration HOUR) < ?" ,[req.body.time]);
        
        routeRes2.forEach((route) => {
            availableDrivers.add(route.iddriver);
        });
        
        const [routeRes3] = await con.promise().query("SELECT route_has_driver.idroute, iddriver FROM route_has_driver INNER JOIN route ON route_has_driver.idroute = route.idroute WHERE DATE_ADD(?, INTERVAL ? HOUR) < route.time", [req.body.time, req.body.duration]);
        
        routeRes3.forEach((route) => {
            availableDrivers.add(route.iddriver);
        });

        if(unavailableDrivers.length){
            const [driverRes] = await con.promise().query("SELECT iddriver FROM driver WHERE suspended = 0 AND iddriver NOT IN (?)", [unavailableDrivers]);
            driverRes.forEach((driver) => {
                availableDrivers.add(driver.iddriver);
            });
        }else{
            const [driverRes] = await con.promise().query("SELECT iddriver FROM driver WHERE suspended = 0");
            driverRes.forEach((driver) => {
                availableDrivers.add(driver.iddriver);
            });
        }
        res.send(200, Array.from(availableDrivers));
    });
});

app.listen(PORT, HOST);
console.log(`Running on: http://${HOST}:3003`)