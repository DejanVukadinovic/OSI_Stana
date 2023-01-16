import Footer from "./Footer";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import axios from "axios";
import { useEffect } from "react";

function HomePage() {
    const user = useSelector(state=>state.user.user)
    useEffect(() => {
        const headers = {Authorization: "Token_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYWRtaW4ifQ.kviVZyJR6-0BtGQa3135RnvedjNW_MBrYLOe4pxwUQ4"}
        axios.get("http://127.0.0.1:3004/reports", {headers}).then(res=>console.log(res.data))
        
    }, [])
    
    return ( <div className="flex flex-col" style={{minHeight:"100vh"}}>
        <Navbar />
        <div className="flex-grow">
            {user?.user_type}
        </div>
        <Footer />
    </div> );
}

export default HomePage;