import Navbar from "./Navbar";
import Footer from "./Footer";
import axios from "axios";
import { useEffect, useState } from "react";
import TicketCard from "./TicketCard";
import ReportCard from "./ReportCard";
import ReportDriverBar from "./ReportDriverBar";
import BusAdminBar from "./BusAdminBar";
function ListBuses() {
    const user = JSON.parse(localStorage.getItem("user"))
    const headers = {Authorization: "Token "+user?.token, "Content-Type":"application/json"}

    const [Buses, setBuses] = useState([])
    
    const fixBus = (e, id)=>{
        axios.put("http://127.0.0.1:3001/bus/activate", {idbus:id}, {headers}).then(res=>{
            console.log(res.data)
        })
    }

    useEffect(() => {
      axios.get("http://127.0.0.1:3001/bus/list", {headers}).then(res=>{
        console.log(res)
        const displayBuses = res.data.map(el=>
        <div className="p-4 border-2 border-blue-800 rounded-md flex justify-between">
            {el.idbus}:{el.carrier} - {el.seats} Seats
            {el.is_working?<div>Working</div>:<div onClick={e=>fixBus(e, el.idbus)} className="p-2 bg-blue-800 cursor-pointer">Not Working</div>}
        </div>)
        console.log(displayBuses)
        setBuses(displayBuses)
      })
    }, [])
    
    return ( 
        <div className="flex flex-col gap" style={{minHeight:"100vh"}}>
        <Navbar/>
        <BusAdminBar/>
        <div className="flex-grow flex flex-col gap-2 p-4">
            {Buses}
        </div>
        <Footer/>
    </div>);
}

export default ListBuses;