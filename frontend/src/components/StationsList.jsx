import Footer from "./Footer";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import axios from "axios";
import { useEffect, useState } from "react";
import RouteCard from "./RouteCard";
import StationCard from "./StationCard";
import StationAdminBar from "./StationAdminBar";
function StationsList() {
    const user = JSON.parse(localStorage.getItem("user"))
    const [Res, setRes] = useState([])
    useEffect(() => {
        const headers = {Authorization: "Token "+user?.token}
        console.log(headers)
        axios.get("http://127.0.0.1:3001/station/list", {headers}).then(res=>{
            console.log(res.data)
            const resArr = res.data.map(el=>{
            return <StationCard data={el}/>})
            setRes(resArr)
            
        })
        
    }, [])
    return ( 
        <div className="flex flex-col" style={{minHeight:"100vh"}}>
        <Navbar />
        <StationAdminBar/>
        <div className="flex-grow px-4 flex flex-col gap-2">
            {Res}
        </div>
        <Footer />
    </div>  );
}

export default StationsList;