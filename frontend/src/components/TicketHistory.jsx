import Navbar from "./Navbar";
import Footer from "./Footer";
import axios from "axios";
import { useEffect, useState } from "react";
import TicketCard from "./TicketCard";
function TicketHistory() {
    const user = JSON.parse(localStorage.getItem("user"))
    const headers = {Authorization: "Token "+user?.token, "Content-Type":"application/json"}

    const [Tickets, setTickets] = useState([])

    useEffect(() => {
      axios.get("http://127.0.0.1:3003/tickets", {headers}).then(res=>{
        const displayTickets = res.data.map(el=><TicketCard ticket={el}/>)
        console.log(displayTickets)
        setTickets(displayTickets)
      })
    }, [])
    
    return ( 
        <div className="flex flex-col gap" style={{minHeight:"100vh"}}>
        <Navbar/>
        <div className="flex-grow flex flex-col gap-2 p-4">
            {Tickets}
        </div>
        <Footer/>
    </div>);
}

export default TicketHistory;