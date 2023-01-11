'use strict'

const express = require("express")
const mysql = require("mysql2")
const jwt = require("jsonwebtoken")
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const Mustache = require('mustache');
const bodyParser = require('body-parser')

const HOST = "0.0.0.0"
const PORT = 3000

var dir = './reports';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

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

let app = express()

app.get('/', (req, res)=>{
    res.send("Hello world!!")
})

app.post('/report/create', jsonParser, authenticateToken, (req, res)=>{
    con.connect(async function(err) {
        if(err) throw err;
        const broken = req.body.issue ?? false;
        console.log("broken: ", broken)
        if(broken){
        let [bus] = await con.promise().query("SELECT idbus FROM route_has_bus WHERE idroute = ?", req.body.route)
        console.log(bus.length, bus[bus.length-1])
        let busid = bus[bus.length-1].idbus
        console.log("idbus: ",busid)
        con.query("UPDATE bus SET is_working = 0 WHERE idbus= ?", busid)


        }

        con.query("INSERT INTO report (content, time, idroute) VALUES (?, CURRENT_TIMESTAMP(), ?)", [req.body.content, req.body.route])
       
        let [resp] = await con.promise().query("SELECT * FROM report ORDER BY idreport DESC LIMIT 1")
        const data = {
            route: req.body.route,
            date:JSON.stringify(resp[0].time).split("T")[0].slice(1),
            time:JSON.stringify(resp[0].time).split("T")[1].slice(0, -6),
            user:req.user.user,
            content:req.body.content
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
            await response.data.pipe(fs.createWriteStream(`reports/report-${resp[0].idreport}.pdf`));
        })();

        res.send(resp)
    })
})

app.get("/reports", authenticateToken, (req, res)=>{
    con.connect( async function(err){
        if(err) {res.send(500);throw err};
        const [report] = await con.promise().query("SELECT report.idreport, report.idroute FROM report")
        res.send(report)
    })
})

app.use('/pdf', express.static(__dirname + '/reports'));
app.listen(PORT, HOST);
console.log("Running on: http:127.0.0.1:3004")