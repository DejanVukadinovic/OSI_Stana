'use strict'

const axios = require("axios");



const admin_headers = {
    "Authorization": "Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNjc0MTQ1MDAxfQ.DeKyxgXkVVxs7O9DBYx83AK7NO-Kn2M4r2ktfBUVoiY"
}

axios.get("http://127.0.0.1:3002/list",
{headers:admin_headers})
.then(res=>{
    console.log(res.data)
    console.log("list ", res.data.login?"-":"+")
    console.assert(!res.data.error,res.data.error)
})

axios.get("http://127.0.0.1:3002/list/drivers",
{headers:admin_headers})
.then(res=>{
    console.log(res.data)
    console.log("list/drivers:", res.data.login?"-":"+")
    console.assert(!res.data.error,res.data.error)
})

axios.get("http://127.0.0.1:3002/list/passengers",
{headers:admin_headers})
.then(res=>{
    console.log(res.data)
    console.log("list/passengers:", res.data.login?"-":"+")
    console.assert(!res.data.error,res.data.error)
})

axios.get("http://127.0.0.1:3001/bus/list",
{headers:admin_headers})
.then(res=>{
    console.log(res.data)
    console.log("bus/list:", res.data.login?"-":"+")
    console.assert(!res.data.error,res.data.error)
})


axios.get("http://127.0.0.1:3001/route/list",
{headers:admin_headers})
.then(res=>{
    console.log(res.data)
    console.log("route/list:", res.data.login?"-":"+")
    console.assert(!res.data.error,res.data.error)
})

axios.get("http://127.0.0.1:3001/route/active_list",
{headers:admin_headers})
.then(res=>{
    console.log(res.data)
    console.log("route/active_list:", res.data.login?"-":"+")
    console.assert(!res.data.error,res.data.error)
})

axios.get("http://127.0.0.1:3001/distance/list",
{headers:admin_headers})
.then(res=>{
    console.log(res.data)
    console.log("distance/list:", res.data.login?"-":"+")
    console.assert(!res.data.error,res.data.error)
})

axios.get("http://127.0.0.1:3004/reports",
{headers:admin_headers})
.then(res=>{
    console.log(res.data)
    console.log("reports:", res.data.login?"-":"+")
    console.assert(!res.data.error,res.data.error)
})

axios.get("http://127.0.0.1:3003/tickets",
{headers:admin_headers})
.then(res=>{
    console.log(res.data)
    console.log("tickets:", res.data.login?"-":"+")
    console.assert(!res.data.error,res.data.error)
})


