import { useState, useEffect } from "react";
import axios from "axios"
import cryptoRandomString from 'crypto-random-string';
function CreateRouteForm() {
    
    const [sData, setsData] = useState()
    const [displayForm, setdisplayForm] = useState()
    const [stations, setstations] = useState()
    const [drivers, setDrivers] = useState([])
    const [buses, setbuses] = useState()
    const [discounts, setdiscounts] = useState()
    const [stationData, setstationData] = useState([])
    const [chosenStations, setchosenStations] = useState([])
    const [chosenStationsData, setchosenStationsData] = useState([])
    const [addDistance, setaddDistance] = useState({show:false})
    const [errors, seterrors] = useState({})
    const [driver, setdriver] = useState()
    const [bus, setbus] = useState()
    const [discount, setdiscount] = useState()


    const user = JSON.parse(localStorage.getItem("user"))
    const headers = {Authorization: "Token "+user?.token, "Content-Type":"application/json"}

    const initRoute = (e)=>{
        e.preventDefault()
        const fData = new FormData(e.target);
        const body = {}
        const tmperr = {}
        for (const [name,value] of fData) {
            if(name!="date" && name!="time"){
                body[name]=value;
                
            }else if(name=="time"){
                body[name]=fData.get("date")+" "+value
            }
            if(name!="duration"){
                if(!value)tmperr[name]="Required: "+name
            }
            
          }
        console.log(Object.keys(tmperr).length)
        if(Object.keys(tmperr).length === 0){
            setsData({...sData, ...body})
        console.log("Submited", sData)
        axios.get("http://127.0.0.1:3001/station/list", {headers}).then(res=>{
        console.log(res.data)
        setstationData(res.data)
        const options = res.data?.map(el=>{return <option value={el.idstation}>{el.name}, @{el.country}</option>})
        setstations(options)})
        axios.put("http://127.0.0.1:3002/available_drivers",{time:body.time, duration:body.duration}, {headers}).then(res=>{
        console.log(res.data)
        const options = res.data?.map(el=>{return <option value={el.iddriver}>{el.name}, @{el.username}</option>})
        setDrivers(options)})
        axios.put("http://127.0.0.1:3001/available_buses",{time:body.time, duration:body.duration}, {headers}).then(res=>{
        console.log(res.data)
        const options = res.data?.map(el=>{return <option value={el.idbus}>{el.carrier}, {el.seats} Seats</option>})
        setbuses(options)})
        axios.get("http://127.0.0.1:3001/discounts/list",{headers}).then(res=>{
        console.log(res.data)
        const options = res.data?.map(el=>{return <option value={el.iddiscounts}>{el.iddiscounts}: x{el.coefficient}</option>})
        setdiscounts(options)})
        }else{
            seterrors(tmperr)
        }
        
    }
    const removeStation = (e, id) =>{
        e.preventDefault()
        console.log(id)
        const newChStationData = chosenStationsData.filter(el=>
            el.uniqueid!=id
        )
        setchosenStationsData(newChStationData)
    }
    const chooseStation = (e) =>{
        if(e.target.value!="-"){
            const station = stationData.filter(el=>el.idstation==e.target.value)[0]
            console.log(chosenStationsData.length)
            if(chosenStationsData.length){
                const body = {idstation:chosenStationsData[chosenStationsData.length-1].idstation, idstation2:e.target.value}
                axios.put("http://127.0.0.1:3001/distance/two_stations", body, {headers}).then(res=>{
                    if(res.data.err){
                        console.log(res.data.err)
                        setaddDistance({show:true, body:body})
                    }else{
                        console.log(res.data.distance)
                        setchosenStationsData([...chosenStationsData, {...station, uniqueid:cryptoRandomString({length: 10})}])
                    }
                })
            }else{
                setchosenStationsData([...chosenStationsData, {...station, uniqueid:cryptoRandomString({length: 10})}])

            }

           
        }
        //const displayStation = 
        //<div className="pl-2 border-2 border-gray-400 text-sm rounded-md">
        //    {station.name}
        //    <button className="bg-red-600 text-white ml-2 text-base px-1" onClick={e=>removeStation(e, station.idstation)}>x</button>
        //</div>
        //setchosenStations([...chosenStations,displayStation ])
    }
    const chooseDriver = e =>{
        e.preventDefault();
        console.log(e.target.value)
        setdriver(e.target.value)
        console.log(driver)
    }
    const chooseBus = e =>{
        e.preventDefault();
        console.log(e.target.value)
        setbus(e.target.value)
        console.log(driver)
    }
    const chooseDiscount = e =>{
        e.preventDefault();
        console.log(e.target.value)
        setdiscount(e.target.value)
  
    }
    const createRoute = e =>{
        e.preventDefault()
        const stationSData = chosenStationsData.map(el=>el.idstation)
        console.log(driver)
        const data = {...sData, stations:stationSData, iddriver:driver, idbus:bus, iddiscount:discount}
        console.log(data)
        axios.post("http://127.0.0.1:3001/route", data, {headers}).then(res=>{
        window.location.reload()
        })
    }
    const uploadDistance = (e, body) =>{
        e.preventDefault();
        const distance = document.querySelector("#distance").value
        const time_estimate = document.querySelector("#timeestimate").value
        console.log("whatever", {...body, distance, time_estimate})
        axios.post("http://127.0.0.1:3001/distance/create",{...body, distance, time_estimate}, {headers} ).then(res=>{
            console.log(res)
            setaddDistance({show:false})
            const station = stationData.filter(el=>el.idstation==body.idstation2)[0]
            setchosenStationsData([...chosenStationsData, {...station, uniqueid:cryptoRandomString({length: 10})}])

        })
    }
    
    const formFirstPart = 
    <form onSubmit={initRoute} className="flex flex-col justify-center text-2xl">
        <label htmlFor="name">Name</label>
        <input type="text" name="name" id="name" className="border-b-2 border-blue-800 outline-none rounded-t-md" />
        {errors.name?<div className="text-red-600 text-sm">{errors.name}</div>:""}
        <label htmlFor="price">Price</label>
        <input type="number" name="price" id="price" className="border-b-2 border-blue-800 outline-none rounded-t-md" />
        {errors.price?<div className="text-red-600 text-sm">{errors.price}</div>:""}
        <label htmlFor="duration">Duration</label>
        <input type="number" name="duration" id="duration" className="border-b-2 border-blue-800 outline-none rounded-t-md" />
        {errors.duration?<div className="text-red-600 text-sm">{errors.duration}</div>:""}
        <label htmlFor="date">Date</label>
        <input type="date" name="date" id="date" className="border-b-2 border-blue-800 outline-none rounded-t-md" />
        {errors.date?<div className="text-red-600 text-sm">{errors.date}</div>:""}
        <label htmlFor="time">Time</label>
        <input type="time" name="time" id="time" className="border-b-2 border-blue-800 outline-none rounded-t-md" />
        {errors.time?<div className="text-red-600 text-sm">{errors.time}</div>:""}
        <button type="submit" className="p-2 bg-blue-800 text-white rounded-lg mt-2">Next</button>
    </form>

    useEffect(() => {
      setdisplayForm(formFirstPart)
    }, [errors])

    useEffect(() => {
        console.log(bus,driver)
      }, [bus, driver])


    useEffect(() => {
        const displayStations = chosenStationsData.map(station=>{
            return <div className="pl-2 border-2 border-gray-400 text-sm rounded-md">
            {station.name}
            <button className="bg-red-600 text-white ml-2 text-base px-1" onClick={e=>removeStation(e, station.uniqueid)}>x</button>
        </div>
        })
        
        
        setchosenStations(displayStations)
        
      }, [chosenStationsData])

    useEffect(() => {
      console.log(stations)
      const form = 
        <form className="flex flex-col justify-center text-2xl gap-3" onSubmit={createRoute}>
            <label htmlFor="stations">Stations:</label>
            <div className="flex gap-2 p-1 border-b-2 border-blue-800">{chosenStations}</div>
            <select name="stations" id="stations" onChange={chooseStation} className="border-b-2 border-blue-800 outline-none rounded-t-md" >
                <option value="-">-</option>
                {stations}
            </select>
            <label htmlFor="iddriver">Driver:</label>
            <select name="iddriver" id="iddriver" onChange={chooseDriver} className="border-b-2 border-blue-800 outline-none rounded-t-md" >
                <option value="0">-</option>
                {drivers}
            </select>
            <label htmlFor="idbus">Bus:</label>
            <select name="idbus" id="idbus" onChange={chooseBus} className="border-b-2 border-blue-800 outline-none rounded-t-md" >
                <option value="0">-</option>
                {buses}
            </select>
            <label htmlFor="iddiscounts">Bus:</label>
            <select name="iddiscounts" id="iddiscounts" onChange={chooseDiscount} className="border-b-2 border-blue-800 outline-none rounded-t-md" >
                <option value="0">-</option>
                {discounts}
            </select>
        {addDistance.show?
        <div className="flex flex-col">
            <label htmlFor="distance">Distance:</label>
            <input type="number" name="distance" id="distance" className="border-b-2 border-blue-800 outline-none rounded-t-md" />
            <label htmlFor="distance">Estimated time:</label>
            <input type="number" name="timeestimate" id="timeestimate" className="border-b-2 border-blue-800 outline-none rounded-t-md" />
            <button onClick={e=>uploadDistance(e, addDistance.body)} className="p-2 bg-blue-800 text-white rounded-lg mt-2">Upload distance</button>
        </div>:""}
        <button type="submit" className="p-2 bg-blue-800 text-white rounded-lg mt-2">Create Route</button>
        </form>
        console.log(form)
        if(stations){

            setdisplayForm(form)
        }
    }, [stations, chosenStations, addDistance, drivers, buses, discounts])
    
   
    return ( 
        <div>
            {displayForm}
        </div>);
}

export default CreateRouteForm;