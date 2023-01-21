import Navbar from "./Navbar";
import Footer from "./Footer";
import axios from "axios";
import { useEffect, useState } from "react";
import TicketCard from "./TicketCard";
import ReportCard from "./ReportCard";
import ReportDriverBar from "./ReportDriverBar";
import RouteCard from "./RouteCard";
function ReportList() {
    const user = JSON.parse(localStorage.getItem("user"))
    const headers = {Authorization: "Token "+user?.token, "Content-Type":"application/json"}

    const [Reports, setReports] = useState([])
    const [sentStyle, setsentStyle] = useState("border-b-2 border-blue-800 cursor-pointer")
    const [missingStyle, setmissingStyle] = useState("cursor-pointer")

    useEffect(() => {
      axios.get("http://127.0.0.1:3004/reports", {headers}).then(res=>{
        console.log(res)
        const displayReports = res.data.map(el=><ReportCard report={el}/>)
        console.log(displayReports)
        setReports(displayReports)
      })
    }, [])
    const displaySent = e=>{
      setsentStyle("border-b-2 border-blue-800 cursor-pointer")
      setmissingStyle("cursor-pointer")
      axios.get("http://127.0.0.1:3004/reports", {headers}).then(res=>{
        console.log(res)
        const displayReports = res.data.map(el=><ReportCard report={el}/>)
        console.log(displayReports)
        setReports(displayReports)
      })

    }
    const displayMissing = e=>{
      setsentStyle("cursor-pointer")
      setmissingStyle("border-b-2 border-blue-800 cursor-pointer")
      axios.get("http://127.0.0.1:3001/latereports", {headers}).then(res=>{
        console.log(res)
        const displayReports = res.data.map(el=><RouteCard data={el}/>)
        console.log(displayReports)
        setReports(displayReports)
      })
    }
    
    return ( 
        <div className="flex flex-col gap" style={{minHeight:"100vh"}}>
        <Navbar/>
        <div className="flex justify-evenly py-2">
        <div className={sentStyle} onClick={displaySent}>Sent</div>
        <div className={missingStyle} onClick={displayMissing}>Missing</div>
        </div>
        <div className="flex-grow flex flex-col gap-2 p-4">
            {Reports}
        </div>
        <Footer/>
    </div>);
}

export default ReportList;