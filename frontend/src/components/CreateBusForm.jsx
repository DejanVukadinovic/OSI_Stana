import axios from "axios"
import { useSelector, useDispatch } from "react-redux";
import { login, logout } from "../redux/user/userActions";
import { useEffect, useState } from "react";
import { json, useNavigate } from "react-router-dom";
function CreateBusForm({id}) {
    const logedUser = JSON.parse(localStorage.getItem("user"))
    const headers = {Authorization: "Token "+logedUser?.token, "Content-Type":"application/json"}

    const [busClasses, setbusClasses] = useState([])
 
    useEffect(() => {
      axios.get("http://127.0.0.1:3004/report/create")
    }, [])
    
    
    let report = (e)=>{
        e.preventDefault()
        const fData = new FormData(e.target)
        const body={route:id, content:fData.get("content")}
        console.log()
        axios.post("http://127.0.0.1:3001/bus", {route:id, content:fData.get("content")}, {headers}).then(res=>{
            console.log(res)
        })
          }
        
    
    return ( <form onSubmit={e=>report(e)} className="flex flex-col justify-center text-2xl">
    <label htmlFor="carrier">Carrier</label>
    <input type="text" name="carrier" id="carrier" className="border-b-2 border-blue-800 outline-none rounded-t-md mb-2" />
    <label htmlFor="seats">Number of seats</label>
    <input type="number" name="seats" id="seats" className="border-b-2 border-blue-800 outline-none rounded-t-md mb-2" />
    <select name="bus_class" id="bus_class">
        {busClasses}
    </select>
    
    <button type="submit" className="p-2 bg-blue-800 text-white rounded-lg">Report</button>
  </form> );
}

export default CreateBusForm;