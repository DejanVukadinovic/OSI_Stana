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
  
    if (token == null) return res.send(400, {err:"Authentication required"})
  
    jwt.verify(token, process.env.JWT_KEY, (err, user) => {
      console.log(err)
  
      if (err) return res.send(token, 403)
  
      req.user = user
  
      next()
    })
  }
  function authenticatePassenger(req, res, next) {
    con.connect(async function(err){
        if(err) throw err;
        const [typeRes] = await con.promise().query("SELECT user_type FROM user WHERE username = ?", [req.user.username])
        console.log(typeRes[0])
        if(typeRes[0].user_type!=2){res.send(403)}
        next()
    })
  }

const app = express()

app.get('/', (req, res)=>{
    res.send("Hello world!!")
})
app.use(cors())
app.use(bodyParser.json())
app.post('/ticket/create', jsonParser, authenticateToken, authenticatePassenger, (req, res)=>{
    con.connect(async function(err) {
        if(err) throw err;
        console.log(req.user)
        const [userRes] = await con.promise().query("SELECT * FROM user NATURAL JOIN bank_account NATURAL JOIN passenger where username = ?", [req.user.username])
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
            }else{res.send({err:"Not enough money"})}
        }else{res.send({err:"Not avaliable"})}
    })
    //res.send("CREATING TICKET")
})

app.get("/tickets", authenticateToken, (req, res)=>{
    con.connect( async function(err){
        if(err) {res.send(500);throw err};
        const [tickets] = await con.promise().query("SELECT * FROM ticket INNER JOIN passenger ON ticket.idpassenger = passenger.idpassenger INNER JOIN route_has_ticket ON route_has_ticket.idticket = ticket.idticket INNER JOIN route ON route_has_ticket.idroute = route.idroute", [req.user.username])
        res.send(tickets)
    })
})

app.use('/pdf', express.static(__dirname + '/tickets'));
app.listen(PORT, HOST);
console.log(`Running on: http://${HOST}:3003`)