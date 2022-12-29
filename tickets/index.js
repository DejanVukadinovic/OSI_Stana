'use strict'

//require('dotenv').config()
const express = require("express");
const mysql = require("mysql2")


const PORT = 3000;
const HOST = '0.0.0.0'

let con = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})
console.log(process.env.DB_ADRESS,process.env.DB_USER,process.env.DB_PASSWORD,process.env.DB_NAME )
con.connect(err=>{
    if(err) throw err;
    con.query("SELECT * FROM user", (err, result, fields)=>{
        if(err)throw err
        console.log(result)
        }
    )
})

const app = express()
app.get('/', (req, res)=>{
    res.send(process.env.DB_HOST + process.env.DB_USER + process.env.DB_PASSWORD + process.env.DB_NAME)
    con.connect(err=>{
        if(err) throw err;
        con.query("SELECT * FROM user", (err, result, fields)=>{
            if(err)throw err
            console.log(result)
            }
        )
    })
})
app.get('/ticket/create', (req, res)=>{
    const mreq = {
        route: 1,
        user: 3,
        nTickets: 1
    }
    con.connect(async function(err) {
        if(err) throw err;
        const [userRes] = await con.promise().query("SELECT * FROM user NATURAL JOIN bank_account NATURAL JOIN passenger where iduser = ?", [mreq.user])
        const [routeRes] = await con.promise().query("SELECT * FROM route NATURAL JOIN route_has_bus NATURAL JOIN bus NATURAL JOIN bus_class WHERE idroute = ?", [mreq.route])
        let isAvaliable = (routeRes[0].seats-routeRes[0].tickets_sold>mreq.nTickets);
        let canBuy = false
        let ticket
        if(isAvaliable){
            if(userRes[0].balance>mreq.nTickets*routeRes[0].price*routeRes[0].price_coefficient){
                canBuy = true
                con.query("UPDATE route SET tickets_sold = ? WHERE idroute = ?", [routeRes[0].tickets_sold+mreq.nTickets, routeRes[0].idroute])
                con.query("UPDATE bank_account SET balance = ? WHERE iduser = ?", [userRes[0].balance-mreq.nTickets*routeRes[0].price*routeRes[0].price_coefficient, mreq.user])
                for (let i = 0; i < mreq.nTickets; i++) {
                    let price= routeRes[0].price*routeRes[0].price_coefficient
                    con.query("INSERT INTO ticket (base_price, luggage, idpassenger) VALUES (?, ?, ?)", [price, 0, userRes[0].idpassenger])
                    ticket = await con.promise().query("SELECT idticket FROM ticket where idpassenger = ? ORDER BY idticket DESC LIMIT 1", [userRes[0].idpassenger])
                    con.query("INSERT INTO route_has_ticket (idroute, idpassenger, idticket) VALUES (?, ?, ?)", [mreq.route, userRes[0].idpassenger, ticket[0][0].idticket ])
                    
                }
            }
        }
        res.send({ticket:ticket[0][0], newBalance:{balance:userRes[0].balance, price:userRes[0].balance-mreq.nTickets*routeRes[0].price*routeRes[0].price_coefficient}})
    })
    //res.send("CREATING TICKET")
})

app.listen(PORT, HOST);
console.log(`Running on: http://${HOST}:3003`)