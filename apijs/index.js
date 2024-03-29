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
const cors = require('cors')

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
        console.log(req.user.username)
        const [typeRes] = await con.promise().query("SELECT user_type FROM user WHERE username = ?", [req.user.username])
        if(typeRes[0].user_type!=0){res.send(403, "Not admin")}
        next()
    })
  }

  const app = express()
  app.use(cors())
  app.use(bodyParser.json())
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
        const [tickets] = await con.promise().query("SELECT ticket.idticket, route_has_ticket.idroute FROM ticket NATURAL JOIN passenger NATURAL JOIN user NATUAL JOIN route_has_ticket where username = ?", [req.user.username])
        res.send(tickets)
    })
})

//idbus,iddriver,iddiscount
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
        else if(!req.body.price && !req.body.idbus){
            res.send(400,{err:"You must enter price or bus."})
            return
        }
        else{
            let flag=1
        for (let i = 0; i < req.body.stations.length; i++) {
            const [stationRes]=await con.promise().query("SELECT * FROM station WHERE station.idstation=?",[req.body.stations[i]])
            if(!stationRes[0]){
                 flag=0
                res.send(400,{err:"All used stations must be defined."}) 
                return
            }
          }
        
         if(flag){
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
                        dist = parseFloat(distance);
                        timedur = parseFloat(time_estimate)
                    

                    if(timedur){
                        timeTotal+=parseFloat(timedur)
                        distanceTotal+=parseFloat(dist)
                    }else{
                        timeless.push(element)
                    }
                }
                });  
              }
              const avgVel = parseFloat(distanceTotal/timeTotal);
              console.log(avgVel)
              timeless.forEach(el=>{
                timeTotal+=parseFloat(el.distance/avgVel)
                console.log(timeTotal)
                distanceTotal+=parseFloat(el.distance)
                console.log(distanceTotal)
              })
              let duration
              if(!req.body.duration){
                duration=0
              }
              else{
                duration=parseFloat(req.body.duration)
              }
              if( timeTotal>duration)duration=parseFloat(timeTotal)
              let price;
              if(req.body.price){ 
                price=parseFloat(req.body.price)
              }
              else{
                const [busRes]=await con.promise().query("SELECT * FROM bus WHERE bus.idbus=?",[req.body.idbus])
                const [classRes]=await con.promise().query("SELECT * FROM bus_class WHERE bus_class.idbus_class=?",[busRes[0].idbus_class])
                price=parseFloat(classRes[0].price_coefficient*distanceTotal)

              }
              let repetition=req.body.repetition?req.body.repetition:0
              await con.promise().query("INSERT INTO route(name,price,repetition,time,duration,tickets_sold,active) VALUES(?,?,?,?,?,?,?)",[req.body.name,price,repetition,req.body.time,duration,0,1])
              const [routeID]=await con.promise().query("SELECT * FROM route WHERE idroute=(SELECT max(idroute) FROM route);")

              let i=0
              for (let i = 0; i < req.body.stations.length; i++){
              await con.promise().query("INSERT INTO station_has_route(idstation,idroute,order_num) VALUES(?,?,?)",
              [req.body.stations[i],routeID[0].idroute,i+1])
              }
              if(req.body.iddriver){
                const [driverRes]=await con.promise().query("SELECT * FROM driver WHERE iddriver=?",[req.body.iddriver])
                if(!driverRes[0]){
                    res.send(400,{message:"Driver does not exist."})
                    return
                }
                else{
                await con.promise().query("INSERT INTO route_has_driver(iddriver,idroute) VALUES(?,?)",[req.body.iddriver,routeID[0].idroute])
              }
            }
              if(req.body.iddiscount){
                const [discountRes]=await con.promise().query("SELECT * FROM discount WHERE iddiscount=?",[req.body.iddiscount])
                if(!discountRes[0]){
                    res.send(400,{message:"Discount does not exist."})
                    return
                }
                else{
                await con.promise().query("INSERT INTO route_has_discounts(idroute,iddiscounts) VALUES(?,?)",[routeID[0].idroute,req.body.iddiscount])
              }
              }
              if(req.body.idbus){
                const [idbusRes]=await con.promise().query("SELECT * FROM bus WHERE idbus=?",[req.body.idbus])
                if(!idbusRes[0]){
                    res.send(400,{message:"Bus does not exist."})
                    return
                }
                else{
                await con.promise().query("INSERT INTO route_has_bus(idroute,idbus) VALUES(?,?)",[routeID[0].idroute,req.body.idbus])

              }
            }
              res.send(200,{message:"Route registered."})
            }
            }

        })

})

app.get('/bus/details', jsonParser, authenticateToken, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        if(!req.body.idbus){
            res.send(400,{err:"You must enter idbus!"})
            return
        }
        const [userRes] = await con.promise().query("SELECT * FROM bus where idbus = ?", [req.body.idbus])
        if(!userRes[0]){
            res.send(400, {err:"Bus details aren't available"})
            return
        }
        const sendRes={idbus:userRes[0].idbus,seats:userRes[0].seats,is_working:userRes[0].is_working,carrier:userRes[0].carrier,idbus_class:userRes[0].idbus_class}
        res.send(200,sendRes)
        
    })
})

app.put('/discounts/edit', jsonParser, authenticateToken, authenticateAdmin, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        if(!req.body.coefficient){
            res.send(400,{err:"You must enter coefficient!"})
            return
        }
        else if(!req.body.iddiscounts){
            res.send(400,{err:"You must enter iddiscounts!"})
            return
        }
        const discountExists = await con.promise().query("SELECT 1 FROM discounts WHERE iddiscounts = ?", [req.body.iddiscounts]);
        if (!discountExists[0].length) {
            res.status(400).json({ err: "Discount with that id doesn't exist" });
            return;
        }
        else{
        await con.promise().query("UPDATE discounts SET coefficient=? WHERE discounts.iddiscounts=?", [req.body.coefficient,req.body.iddiscounts])
        
        res.send(200, {message:"Discount changed!"})
        }
    })
})

app.put('/discounts/delete', jsonParser, authenticateToken, authenticateAdmin, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        if(!req.body.iddiscounts){
            res.send(400,{err:"You must enter iddiscounts!"})
            return
        }
        const discountExists = await con.promise().query("SELECT 1 FROM discounts WHERE iddiscounts = ?", [req.body.iddiscounts]);
        if (!discountExists[0].length) {
            res.status(400).json({ err: "Discount with that id doesn't exist" });
            return;
        }
        else{
        await con.promise().query("UPDATE discounts SET deleted=? WHERE discounts.iddiscounts=?", [1,req.body.iddiscounts])
        
        res.send(200, {message:"Discount deleted!"})
        }
    })
})

app.put('/busclass/delete', jsonParser, authenticateToken, authenticateAdmin, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        if(!req.body.idbus_class){
            res.send(400,{err:"You must enter idbus_class!"})
            return
        }
        const busclassExists = await con.promise().query("SELECT 1 FROM bus_class WHERE idbus_class = ?", [req.body.idbus_class]);
        if (!busclassExists[0].length) {
            res.status(400).json({ err: "Bus class with that id doesn't exist" });
            return;
        }
        else{
        await con.promise().query("UPDATE bus_class SET deleted=? WHERE bus_class.idbus_class=?", [1,req.body.idbus_class])
        
        res.send(200, {message:"Bus class deleted!"})
        }
    })
})

app.put('/route/delete', jsonParser, authenticateToken, authenticateAdmin, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        if(!req.body.idroute){
            res.send(400,{err:"You must enter idroute!"})
            return
        }
        const routeExists = await con.promise().query("SELECT 1 FROM route WHERE idroute = ?", [req.body.idroute]);
        if (!routeExists[0].length) {
            res.status(400).json({ err: "Route with that id doesn't exist" });
            return;
        }
        else{
        await con.promise().query("UPDATE route SET active=? WHERE route.idroute=?", [0,req.body.idroute])
        
        res.send(200, {message:"Route deleted!"})
        }
    })
})

app.post('/discount', jsonParser, authenticateToken, authenticateAdmin, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        else if(!req.body.coefficient){
            res.send(400,{err:"You must enter coefficient!"})
            return
        }
        await con.promise().query("INSERT INTO discounts(min_age,max_age,coefficient,deleted) VALUES(?,?,?,?)", [1,10,req.body.coefficient,0])
        
        res.send(200, {message:"Discount has been added!"})
    })
})

app.post('/bus_class', jsonParser, authenticateToken, authenticateAdmin, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        console.log(req.body)
        if(!req.body.description){
            res.send(400,{err:"You must enter bus class description!"})
            return
        }
        else if(!req.body.price_coefficient){
            res.send(400,{err:"You must enter price coefficient!"})
            return
        }
        console.log(req.body)
        await con.promise().query("INSERT INTO bus_class(description,price_coefficient,deleted) VALUES(?,?,?)", [req.body.description,req.body.price_coefficient,0])
        
        res.send(200, {message:"Bus class has been set!"})
    })
})

app.get('/bus/list', jsonParser, authenticateToken, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        console.log(req.body)
        const [userRes]=await con.promise().query("SELECT * FROM bus")
        if(!userRes[0]){
            res.send(400, {err:"Bus details aren't available"})
            return
        }
        
        let sendRes = []
        userRes.forEach((bus) => {
            sendRes.push({
                idbus: bus.idbus,
                seats: bus.seats,
                is_working: bus.is_working,
                carrier: bus.carrier,
                idbus_class: bus.idbus_class
            });
        });
        res.send(200, sendRes)
    })
});

app.post('/route/set_driver', jsonParser, authenticateToken, authenticateAdmin, (req, res) => {
    con.connect(async function (err) {
        if (err) throw err;
        if (!req.body.idroute) {
            res.status(400).json({ err: "You must enter idroute!" });
            return;
        } else if (!req.body.iddriver) {
            res.status(400).json({ err: "You must enter iddriver!" });
            return;
        }

        const routeExists = await con.promise().query("SELECT 1 FROM route WHERE idroute = ?", [req.body.idroute]);
        if (!routeExists[0].length) {
            res.status(400).json({ err: "Entered idroute does not exist!" });
            return;
        }

        const driverExists = await con.promise().query("SELECT 1 FROM driver WHERE iddriver = ?", [req.body.iddriver]);
        if (!driverExists[0].length) {
            res.status(400).json({ err: "Entered iddriver does not exist!" });
            return;
        }

        const routeDriver = await con.promise().query("SELECT 1 FROM route_has_driver WHERE idroute = ?", [req.body.idroute]);
        if(routeDriver[0].length){
            await con.promise().query("UPDATE route_has_driver SET iddriver=? WHERE route_has_driver.idroute=?", [req.body.iddriver,req.body.idroute])
            res.status(400).json({ message: "New driver has been set to the route!" });
            return;
        }

        await con.promise().query("INSERT INTO route_has_driver (idroute,iddriver) VALUES (?,?)", [req.body.idroute, req.body.iddriver]);

        res.send(200,{ message: "Driver has been set to the route!" });
    });
});

app.put('/bus/deactivate', jsonParser, authenticateToken, authenticateAdmin, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        if(!req.body.idbus){
            res.send(400,{err:"You must enter idbus!"})
            return
        }
        const [userRes] = await con.promise().query("SELECT * FROM bus where idbus = ?", [req.body.idbus])
        if(!userRes[0]){
            res.send(400, {err:"Bus with this idbus doesn't exist"})
            return
        }
        let updateQuery = "UPDATE bus SET is_working = 0 WHERE idbus = ?";
        await con.promise().query(updateQuery, [req.body.idbus])
        res.send(200,{message: "Bus is_working value has been set to 0!"})
    })
});


app.put('/bus/activate', jsonParser, authenticateToken, authenticateAdmin, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        if(!req.body.idbus){
            res.send(400,{err:"You must enter idbus!"})
            return
        }
        const [userRes] = await con.promise().query("SELECT * FROM bus where idbus = ?", [req.body.idbus])
        if(!userRes[0]){
            res.send(400, {err:"Bus with this idbus doesn't exist"})
            return
        }
        let updateQuery = "UPDATE bus SET is_working = 1 WHERE idbus = ?";
        await con.promise().query(updateQuery, [req.body.idbus])
        res.send(200,{message: "Bus is_working value has been set to 1!"})
    })
});

app.get('/route/list', jsonParser, authenticateToken, authenticateAdmin, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        console.log(req.body)
        const [userRes]=await con.promise().query("SELECT * FROM route")
        if(!userRes[0]){
            res.send(400, {err:"Route details aren't available"})
            return
        }
        
        let sendRes = []
        userRes.forEach((route) => {
            sendRes.push({
                idroute: route.idroute,
                name: route.name,
                price: route.price,
                repeat: route.repeat,
                time: route.time,
                duration: route.duration,
                tickets_sold: route.tickets_sold,
                active: route.active
            });
        });
        res.send(200, sendRes)
    })
});

app.get('/station/list', jsonParser, authenticateToken, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        console.log(req.body)
        const [userRes]=await con.promise().query("SELECT * FROM station where deleted=0")
        if(!userRes[0]){
            res.send(400, {err:"Station details aren't available"})
            return
        }
        
        let sendRes = []
        userRes.forEach((station) => {
            sendRes.push({
                idstation: station.idstation,
                name: station.name,
                country: station.country,
                deleted: station.deleted
            });
        });
        res.send(200, sendRes)
    })
});

app.get('/route/details', jsonParser, authenticateToken, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        if(!req.body.idroute){
            res.send(400,{err:"You must enter idroute!"})
            return
        }
        const [userRes] = await con.promise().query("SELECT * FROM route where idroute = ?", [req.body.idroute])
        if(!userRes[0]){
            res.send(400, {err:"Route details aren't available"})
            return
        }
        const sendRes={idroute:userRes[0].idroute,name:userRes[0].name,price:userRes[0].price,repeat:userRes[0].repeat,time:userRes[0].time,duration:userRes[0].duration,tickets_sold:userRes[0].tickets_sold,active:userRes[0].active}
        res.send(200,sendRes)
        
    })
})

app.get('/route/active_list', jsonParser, authenticateToken, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        const [userRes]=await con.promise().query("SELECT * FROM route WHERE active = 1 and CURRENT_TIMESTAMP()<route.time")
        if(!userRes[0]){
            res.send(400, {err:"Route details aren't available"})
            return
        }
        
        let sendRes = []
        userRes.forEach((route) => {
            sendRes.push({
                idroute: route.idroute,
                name: route.name,
                price: route.price,
                repeat: route.repeat,
                time: route.time,
                duration: route.duration,
                tickets_sold: route.tickets_sold,
                active: route.active
            });
        });
        res.send(200, sendRes)
    })
});

app.put('/distance/two_stations', jsonParser, authenticateToken, authenticateAdmin, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        if(!req.body.idstation || !req.body.idstation2){
            res.send(400,{err:"You must enter both idstation and idstation2!"})
            return
        }
        const [distanceRes] = await con.promise().query("SELECT distance, s1.name as name1, s2.name as name2, d.idstation, d.idstation2 FROM distance d join station s1 on d.idstation = s1.idstation join station s2 on d.idstation2 = s2.idstation where (d.idstation = ? and d.idstation2 = ?) or (d.idstation = ? and d.idstation2 = ?)", [req.body.idstation,req.body.idstation2,req.body.idstation2,req.body.idstation])

        if(!distanceRes[0]){
            res.send(200, {err:"Distance details aren't available"})
            return
        }
        const sendRes={idstation: distanceRes[0].idstation, name1: distanceRes[0].name1, idstation2: distanceRes[0].idstation2, name2: distanceRes[0].name2, distance:distanceRes[0].distance}
        res.send(200,sendRes)
    })
})



app.get('/distance/list', jsonParser, authenticateToken, authenticateAdmin, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;

        const [distanceRes] = await con.promise().query("SELECT distance.*, station1.name as station1_name, station2.name as station2_name FROM distance JOIN station as station1 ON distance.idstation = station1.idstation JOIN station as station2 ON distance.idstation2 = station2.idstation")
        if(!distanceRes[0]){
            res.send(400, {err:"Distance details aren't available"})
            return
        }
        
        let sendRes = []
        distanceRes.forEach((distance) => {
            sendRes.push({
                station1_name: distance.station1_name,
                station2_name: distance.station2_name,
                idstation: distance.idstation,
                idstation2: distance.idstation2,
                distance: distance.distance,
                time_estimate: distance.time_estimate
            });
        });
        res.send(200, sendRes)
    });
});

app.post('/bus', jsonParser, authenticateToken, authenticateAdmin, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        console.log(req.body)
        if(!req.body.seats){
            res.send(400,{err:"You must enter number of seats!"})
            return
        }
        else if(!req.body.carrier){
            res.send(400,{err:"You must enter carrier!"})
            return
        }
        else if(!req.body.idbus_class){
            res.send(400,{err:"You must enter idbus_class!"})
            return
        }
        const busclassExists = await con.promise().query("SELECT 1 FROM bus_class WHERE idbus_class = ?", [req.body.idbus_class]);
        if (!busclassExists[0].length) {
            res.status(400).json({ err: "That bus class does not exist" });
            return;
        }
        else{
        console.log(req.body)
        await con.promise().query("INSERT INTO bus(seats,is_working,carrier,idbus_class) VALUES(?,?,?,?)", [req.body.seats,1,req.body.carrier,req.body.idbus_class])
        
        res.send(200, {message:"Bus details have been set!"})
        }
    })
})

app.post('/station/create', jsonParser, authenticateToken, authenticateAdmin, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        console.log(req.body)
        if(!req.body.name){
            res.send(400,{err:"You must enter station name!"})
            return
        }
        else if(!req.body.country){
            res.send(400,{err:"You must enter station country!"})
            return
        }
        console.log(req.body)
        await con.promise().query("INSERT INTO station(name,country,deleted) VALUES(?,?,?)", [req.body.name,req.body.country,0])
        
        res.send(200, {message:"Station has been set!"})
    })
})

app.put('/station/delete', jsonParser, authenticateToken, authenticateAdmin, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        if(!req.body.idstation){
            res.send(400,{err:"You must enter idstation!"})
            return
        }
        const stationExists = await con.promise().query("SELECT 1 FROM station WHERE idstation = ?", [req.body.idstation]);
        if (!stationExists[0].length) {
            res.status(400).json({ err: "Station with that id doesn't exist" });
            return;
        }
        else{
        await con.promise().query("UPDATE station SET deleted=? WHERE station.idstation=?", [1,req.body.idstation])
        
        res.send(200, {message:"Station deleted!"})
        }
    })
})

app.post('/distance/create', jsonParser, authenticateToken, authenticateAdmin, (req, res) => {
    con.connect(async function(err) {
        if (err) throw err;
        console.log(req.body);
        if (!req.body.idstation || !req.body.idstation2 || !req.body.distance || !req.body.time_estimate) {
            res.send(400, {err: "You must enter all required fields, idstation, idstation2, distance and time estimate"})
            return;
        }
        const [stations] = await con.promise().query("SELECT s1.idstation, s2.idstation FROM station s1 JOIN station s2 ON s1.idstation = ? AND s2.idstation = ? WHERE s1.deleted = 0 AND s2.deleted = 0", [req.body.idstation, req.body.idstation2]);
        if (stations.length === 0) {
            res.send(400, {err: "One or both of the stations are deleted."});
        } else {
            await con.promise().query("INSERT INTO distance(idstation, idstation2, distance, time_estimate) VALUES (?,?,?,?)", [req.body.idstation, req.body.idstation2, req.body.distance, req.body.time_estimate]);
            res.send(200, {message: "Distance has been set!"});
        }
    });
});

app.post('/route/set_bus', jsonParser, authenticateToken, authenticateAdmin, (req, res) => {
    con.connect(async function (err) {
        if (err) throw err;
        if (!req.body.idroute) {
            res.status(400).json({ err: "You must enter idroute!" });
            return;
        } else if (!req.body.idbus) {
            res.status(400).json({ err: "You must enter idbus!" });
            return;
        }

        const routeExists = await con.promise().query("SELECT 1 FROM route WHERE idroute = ?", [req.body.idroute]);
        if (!routeExists[0].length) {
            res.status(400).json({ err: "Entered route does not exist!" });
            return;
        }

        const busExists = await con.promise().query("SELECT 1 FROM bus WHERE idbus = ?", [req.body.idbus]);
        if (!busExists[0].length) {
            res.status(400).json({ err: "Entered bus does not exist!" });
            return;
        }

        const routeBus = await con.promise().query("SELECT 1 FROM route_has_bus WHERE idroute = ?", [req.body.idroute]);
        if(routeBus[0].length){
            await con.promise().query("UPDATE route_has_bus SET idbus=? WHERE route_has_bus.idroute=?", [req.body.idbus,req.body.idroute])
            res.status(400).json({ message: "New bus has been set to the route!" });
            return;
        }

        await con.promise().query("INSERT INTO route_has_bus (idroute,idbus) VALUES (?,?)", [req.body.idroute, req.body.idbus]);

        res.send(200,{ message: "Bus has been set to the route!" });
    });
});

app.post('/route/set_discount', jsonParser, authenticateToken, authenticateAdmin, (req, res) => {
    con.connect(async function (err) {
        if (err) throw err;
        if (!req.body.idroute) {
            res.status(400).json({ err: "You must enter idroute!" });
            return;
        } else if (!req.body.iddiscounts) {
            res.status(400).json({ err: "You must enter iddiscounts!" });
            return;
        }

        const routeExists = await con.promise().query("SELECT 1 FROM route WHERE idroute = ?", [req.body.idroute]);
        if (!routeExists[0].length) {
            res.status(400).json({ err: "Entered idroute does not exist!" });
            return;
        }

        const discountExists = await con.promise().query("SELECT 1 FROM discounts WHERE iddiscounts = ?", [req.body.iddiscounts]);
        if (!discountExists[0].length) {
            res.status(400).json({ err: "Entered iddiscounts does not exist!" });
            return;
        }
        
        const routeDiscount = await con.promise().query("SELECT 1 FROM route_has_discounts WHERE idroute = ?", [req.body.idroute]);
        if(routeDiscount[0].length){
            await con.promise().query("UPDATE route_has_discounts SET iddiscounts=? WHERE route_has_discounts.idroute=?", [req.body.iddiscounts,req.body.idroute])
            res.status(400).json({ message: "New discount has been set to the route!" });
            return;
        }

        await con.promise().query("INSERT INTO route_has_discounts (idroute,iddiscounts) VALUES (?,?)", [req.body.idroute, req.body.iddiscounts]);

        res.send(200,{ message: "Discount has been set to the route!" });
    });
});

app.get('/busclass/list', jsonParser, authenticateToken, authenticateAdmin, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        console.log(req.body)
        const [userRes]=await con.promise().query("SELECT * FROM bus_class")
        if(!userRes[0]){
            res.send(400, {err:"Bus class details aren't available"})
            return
        }
        
        let sendRes = []
        userRes.forEach((bus_class) => {
            sendRes.push({
                idbus_class: bus_class.idbus_class,
                description: bus_class.description,
                price_coefficient: bus_class.price_coefficient,
                deleted: bus_class.deleted
            });
        });
        res.send(200, sendRes)
    })
});

app.put('/available_buses', jsonParser, authenticateToken, authenticateAdmin, (req, res) => {
    con.connect(async function(err) {
        if (err) throw err;
        if (!req.body.time) {
            res.status(400).json({ err: "You must enter time!" });
            return;
        } else if (!req.body.duration) {
            res.status(400).json({ err: "You must enter duration!" });
            return;
        }
        let availableBuses = new Set();

        const [routeRes] = await con.promise().query("SELECT route_has_bus.idroute, idbus FROM route_has_bus INNER JOIN route ON route_has_bus.idroute = route.idroute WHERE route.time = ?", [req.body.time]);

        let unavailableBuses = [];
        routeRes.forEach((route) => {
            unavailableBuses.push(route.idbus);
        });

        const [routeRes2] = await con.promise().query("SELECT route_has_bus.idroute, idbus FROM route_has_bus INNER JOIN route ON route_has_bus.idroute = route.idroute WHERE DATE_ADD(route.time, INTERVAL route.duration HOUR) < ?" ,[req.body.time]);

        routeRes2.forEach((route) => {
            availableBuses.add(route.idbus);
        });

        const [routeRes3] = await con.promise().query("SELECT route_has_bus.idroute, idbus FROM route_has_bus INNER JOIN route ON route_has_bus.idroute = route.idroute WHERE DATE_ADD(?, INTERVAL ? HOUR) < route.time", [req.body.time, req.body.duration]);

        routeRes3.forEach((route) => {
            availableBuses.add(route.idbus);
        });

        if(unavailableBuses.length){
            const [busesRes] = await con.promise().query("SELECT bus.idbus, bus.seats, bus.is_working, bus.carrier, bus.idbus_class, bus_class.description, bus_class.price_coefficient, bus_class.deleted FROM bus INNER JOIN bus_class ON bus.idbus_class = bus_class.idbus_class WHERE bus.is_working = 1 AND bus.idbus NOT IN (?)", [unavailableBuses]);
            res.send(200, busesRes);
        }else{
            const [busesRes] = await con.promise().query("SELECT bus.idbus, bus.seats, bus.is_working, bus.carrier, bus.idbus_class, bus_class.description, bus_class.price_coefficient, bus_class.deleted FROM bus INNER JOIN bus_class ON bus.idbus_class = bus_class.idbus_class WHERE bus.is_working = 1");
            res.send(200, busesRes);
        }
    });
});

app.get('/discounts/list', jsonParser, authenticateToken, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        console.log(req.body)
        const [userRes]=await con.promise().query("SELECT * FROM discounts")
        if(!userRes[0]){
            res.send(400, {err:"Discount details aren't available"})
            return
        }
        
        let sendRes = []
        userRes.forEach((discounts) => {
            sendRes.push({
                iddiscounts: discounts.iddiscounts,
                min_age: discounts.min_age,
                max_age: discounts.max_age,
                coefficient: discounts.coefficient,
                deleted: discounts.deleted
            });
        });
        res.send(200, sendRes)
    })
});
app.get("/latereports", jsonParser, authenticateToken, authenticateAdmin, (req, res)=>{
    con.connect(async function(err){
        if(err) throw err;
        const missingList = []
        const [routes] = await con.promise().query("select * from route where DATE_ADD(route.time, INTERVAL route.duration+24 HOUR) < current_timestamp()")
        for(let i = 0; i<routes.length; i++){
        
            const [reports] = await con.promise().query("select * from report where idroute =?", [routes[i].idroute])
            console.log(reports.length)
            if(reports.length==0){
                console.log(reports.length, routes[i])
                missingList.push(routes[i]);
            }
            console.log(missingList)


        }
        console.log("missing:",missingList)
        res.send(200, missingList)
    })
})

app.use('/pdf', express.static(__dirname + '/tickets'));
app.listen(PORT, HOST);
console.log(`Running on: http://${HOST}:3001`)