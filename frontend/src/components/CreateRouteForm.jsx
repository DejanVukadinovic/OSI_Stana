import { useState, useEffect } from "react";
import axios from "axios"
import cryptoRandomString from 'crypto-random-string';
function CreateRouteForm() {
    
    const [sData, setsData] = useState()
    const [displayForm, setdisplayForm] = useState()
    const [stations, setstations] = useState()
    const [stationData, setstationData] = useState([])
    const [chosenStations, setchosenStations] = useState([])
    const [chosenStationsData, setchosenStationsData] = useState([])


    const user = JSON.parse(localStorage.getItem("user"))
    const headers = {Authorization: "Token "+user?.token, "Content-Type":"application/json"}

    const initRoute = (e)=>{
        e.preventDefault()
        const fData = new FormData(e.target);
        const body = {}
        for (const [name,value] of fData) {
            body[name]=value;
          }
        setsData({...sData, ...body})
        console.log("Submited", sData)
        axios.get("http://127.0.0.1:3001/station/list", {headers}).then(res=>{
        console.log(res.data)
        setstationData(res.data)
        const options = res.data?.map(el=>{return <option value={el.idstation}>{el.name}, @{el.country}</option>})
        setstations(options)
        
    })
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
            console.log(station)
            
            setchosenStationsData([...chosenStationsData, {...station, uniqueid:cryptoRandomString({length: 10})}])
           
        }
        //const displayStation = 
        //<div className="pl-2 border-2 border-gray-400 text-sm rounded-md">
        //    {station.name}
        //    <button className="bg-red-600 text-white ml-2 text-base px-1" onClick={e=>removeStation(e, station.idstation)}>x</button>
        //</div>
        //setchosenStations([...chosenStations,displayStation ])
    }
    const createRoute = e =>{
        e.preventDefault()
        const stationSData = chosenStationsData.map(el=>el.idstation)
        console.log({...sData, stations:stationSData})
    }
    
    
    const formFirstPart = 
    <form onSubmit={initRoute} className="flex flex-col justify-center text-2xl">
        <label htmlFor="name">Name</label>
        <input type="text" name="name" id="name" className="border-b-2 border-blue-800 outline-none rounded-t-md" />
        <label htmlFor="username">Price</label>
        <input type="number" name="price" id="price" className="border-b-2 border-blue-800 outline-none rounded-t-md" />
        <label htmlFor="username">Duration</label>
        <input type="number" name="duration" id="duration" className="border-b-2 border-blue-800 outline-none rounded-t-md" />
        <label htmlFor="username">Date</label>
        <input type="date" name="date" id="date" className="border-b-2 border-blue-800 outline-none rounded-t-md" />
        <label htmlFor="username">Time</label>
        <input type="time" name="time" id="time" className="border-b-2 border-blue-800 outline-none rounded-t-md" />
        <button type="submit" className="p-2 bg-blue-800 text-white rounded-lg mt-2">Next</button>
    </form>
    useEffect(() => {
      setdisplayForm(formFirstPart)
    }, [])
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
        <button type="submit" className="p-2 bg-blue-800 text-white rounded-lg mt-2">Create Route</button>
        </form>
        console.log(form)
        if(stations){

            setdisplayForm(form)
        }
    }, [stations, chosenStations])
    
   
    return ( 
        <div>
            {displayForm}
        </div>);
}

export default CreateRouteForm;