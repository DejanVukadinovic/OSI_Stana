import Footer from "./Footer";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import axios from "axios";
import { useEffect, useState } from "react";
import RouteCard from "./RouteCard";

function HomePage() {
    const user = JSON.parse(localStorage.getItem("user"))
    const [Res, setRes] = useState([])
    useEffect(() => {
        const headers = {Authorization: "Token "+user?.token}
        console.log(headers)
        axios.get("http://127.0.0.1:3001/route/list", {headers}).then(res=>{
            console.log(res.data)
            const resArr = res.data.map(el=>{
                el.date=el.time.split("T")[0]
                el.time=JSON.stringify(el.time).split("T")[1].slice(0, -6);
            return <RouteCard data={el}/>})
            setRes(resArr)
            
        })
        
    }, [])
    
    return ( <div className="flex flex-col" style={{minHeight:"100vh"}}>
        <Navbar />
        <div className="flex-grow p-4 flex flex-col">
            {Res}
        </div>
        <Footer />
    </div> );
}

export default HomePage;