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
const {PRICE_COEFFICIENT}=require('./price_coefficient')

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

  function authenticateAdmin(req, res, next) {
    con.connect(async function(err){
        if(err) throw err;
        const [typeRes] = await con.promise().query("SELECT user_type FROM user WHERE username = ?", [req.user.user])
        if(typeRes[0]){res.send(403)}
        next()
    })
  }

const app = express()
app.get('/', (req, res)=>{
    res.send("Hello world!!")
})
app.post('/ticket/create', jsonParser, authenticateToken, (req, res)=>{
    con.connect(async function(err) {
        if(err) throw err;
        
        const [userRes] = await con.promise().query("SELECT * FROM user NATURAL JOIN bank_account NATURAL JOIN passenger where username = ?", [req.user.user])
        const [routeRes] = await con.promise().query("SELECT * FROM route NATURAL JOIN route_has_bus NATURAL JOIN bus NATURAL JOIN bus_class WHERE idroute = ?", [req.body.route])
        let isAvaliable = (routeRes[0].seats-routeRes[0].tickets_sold>req.body.nTickets);
        let canBuy = false
        let ticketList = []
        console.log(userRes[0].idpassenger, isAvaliable)
        if(isAvaliable){
            console.log(userRes[0].balance>req.body.nTickets*routeRes[0].price*routeRes[0].price_coefficient)
            if(userRes[0].balance>req.body.nTickets*routeRes[0].price*routeRes[0].price_coefficient){
                console.log("tu smo, req")
                canBuy = true
                con.query("UPDATE route SET tickets_sold = ? WHERE idroute = ?", [routeRes[0].tickets_sold+req.body.nTickets, routeRes[0].idroute])
                console.log([userRes[0].balance-req.body.nTickets*routeRes[0].price*routeRes[0].price_coefficient, userRes[0].idpassenger])
                con.query("UPDATE bank_account SET balance = ? WHERE idpassenger = ?", [userRes[0].balance-req.body.nTickets*routeRes[0].price*routeRes[0].price_coefficient, userRes[0].idpassenger])
                for (let i = 0; i < req.body.nTickets; i++) {
                    let price= routeRes[0].price*routeRes[0].price_coefficient
                    con.query("INSERT INTO ticket (base_price, luggage, idpassenger) VALUES (?, ?, ?)", [price, 0, userRes[0].idpassenger])
                    let [ticket] = await con.promise().query("SELECT idticket FROM ticket where idpassenger = ? ORDER BY idticket DESC LIMIT 1", [userRes[0].idpassenger])
                    console.log("ticket: ")
                    console.log([price, 0, userRes[0].idpassenger])
                    con.query("INSERT INTO route_has_ticket (idroute, idpassenger, idticket) VALUES (?, ?, ?)", [req.body.route, userRes[0].idpassenger, ticket[0].idticket ])
                    let [ticketdata] = await con.promise().query("SELECT * FROM ticket NATURAL JOIN route where idticket = ?", [ticket[0].idticket])
                    ticketList.push(ticket[0])
                    console.log(JSON.stringify(routeRes[0].time).split("T")[0].slice(1), JSON.stringify(routeRes[0].time).split("T")[1].slice(0, -6))
                    const data = {
                        route: routeRes[0].idroute,
                        date:JSON.stringify(routeRes[0].time).split("T")[0].slice(1),
                        time:JSON.stringify(routeRes[0].time).split("T")[1].slice(0, -6),
                        passenger:userRes[0].name,
                        price:price
                      }
                      // Read the HTML template from disk.
                      const template = fs.readFileSync('index.html', { encoding: 'utf8' });
                      const filledTemplate = Mustache.render(template, data);
                      const body = new FormData();
                        body.append('index.html', filledTemplate, { filename: 'index.html' });
                        body.append('generation', JSON.stringify(generation));
                      (async () => {
                        // Send the request to Processor.
                        const response = await axios.post('http://pdfprocessor:5000/process', body, {
                            headers: body.getHeaders(),
                            responseType: 'stream',
                        });
                        // Save the result to a file on disk.
                        await response.data.pipe(fs.createWriteStream(`tickets/ticket-${ticket[0].idticket}.pdf`));
                    })();
                    
                }res.send({"ticket":ticketList})
            }else{res.send("Not enough money")}
        }else{res.send("Not avaliable")}
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


app.post('/route', jsonParser, authenticateToken, authenticateAdmin, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        if(!req.body.name){
            res.send(400,{err:"You must enter a route name."})
            return
        }
        else if(!req.body.time){
            res.send(400,{err:"You must enter a departure time."})
            return
        }
        else if(!req.body.stations.length){
            res.send(400,{err:"You must enter route stations."})
            return
        }
        
        for (let i = 0; i < req.body.stations.length; i++) {
            const [stationRes]=await con.promise().query("SELECT * FROM station WHERE station.idstation=?",[req.body.stations[i]])
            if(!stationRes[0]){
                res.send(400,{err:"All used stations must be defined."}) 
                return
            }
          }

        
            const [distanceRes]=await con.promise().query("SELECT * FROM distance")
            let distanceTotal =0;
            let timeTotal=0;
            let timeless = []
            for (let i = 0; i < req.body.stations.length-1; i++) {
                let idf = req.body.stations[i]
                let ids = req.body.stations[i+1]
                let dist = 0
                let timedur = 0
                distanceRes.forEach(element => {
                    let {idstation, idstation2, distance, time_estimate} = element
                    if ((idf==idstation && ids==idstation2)||(idf==idstation2 && ids==idstation)){
                        dist = distance;
                        timedur = time_estimate
                        
                    if(timedur){
                        timeTotal+=parseFloat(timedur)
                        distanceTotal+=parseFloat(dist)
                        console.log(timeTotal)
                        console.log(distanceTotal)
                    }else{
                        timeless.push(element)
                    }
                }
                });  
              }
              const avgVel = distanceTotal/timeTotal;
              timeless.forEach(el=>{
                timeTotal+=el.distance*avgVel
                distanceTotal+=el.distance
              })
              let duration=req.body.duration
              if( timeTotal>req.body.duration)duration=timeTotal
              let price;
              if(!req.body.price) price=parseFloat(distanceTotal)*PRICE_COEFFICIENT
              else price=req.body.price
              let repetition=req.body.repetition?req.body.repetition:0
              await con.promise().query("INSERT INTO route(name,price,repetition,time,duration,tickets_sold,active) VALUES(?,?,?,?,?,?,?)",
              [req.body.name,price,repetition,req.body.time,duration,0,1])
              let i=0
              const [routeID]=await con.promise().query("SELECT * FROM route WHERE idroute=(SELECT max(idroute) FROM route);")
              for (let i = 0; i < req.body.stations.length; i++){
              await con.promise().query("INSERT INTO station_has_route(idstation,idroute,order_num) VALUES(?,?,?)",
              [req.body.stations[i],routeID[0].idroute,i+1])
              }
             
              
        })
        res.send(200,{message:"Route registered."})
        
})
app.use('/pdf', express.static(__dirname + '/tickets'));
app.listen(PORT, HOST);
console.log(`Running on: http://${HOST}:3001`)