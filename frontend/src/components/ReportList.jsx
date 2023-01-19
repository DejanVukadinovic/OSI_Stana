import Navbar from "./Navbar";
import Footer from "./Footer";
import axios from "axios";
import { useEffect, useState } from "react";
import TicketCard from "./TicketCard";
import ReportCard from "./ReportCard";
import ReportDriverBar from "./ReportDriverBar";
function ReportList() {
    const user = JSON.parse(localStorage.getItem("user"))
    const headers = {Authorization: "Token "+user?.token, "Content-Type":"application/json"}

    const [Reports, setReports] = useState([])

    useEffect(() => {
      axios.get("http://127.0.0.1:3004/reports", {headers}).then(res=>{
        console.log(res)
        const displayReports = res.data.map(el=><ReportCard report={el}/>)
        console.log(displayReports)
        setReports(displayReports)
      })
    }, [])
    
    return ( 
        <div className="flex flex-col gap" style={{minHeight:"100vh"}}>
        <Navbar/>
        <div className="flex-grow flex flex-col gap-2 p-4">
            {Reports}
        </div>
        <Footer/>
    </div>);
}

export default ReportList;