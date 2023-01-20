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
      axios.get("http://127.0.0.1:3001/busclass/list", {headers}).then(res=>{
        const displayClasses = res.data.map(el=><option value={el.idbus_class}>{el.description}</option>)
        setbusClasses(displayClasses)
        console.log(res.data)
      })
    }, [])
    
    
    let report = (e)=>{
        e.preventDefault()
        const fData = new FormData(e.target)
        const body={carrier:fData.get("carrier"), seats:fData.get("seats"), idbus_class:fData.get("bus_class")}
        console.log()
        axios.post("http://127.0.0.1:3001/bus",
        body,
        {headers}).then(res=>{
            console.log(res)
            window.location.reload()
        })
          }
        
    
    return ( <form onSubmit={e=>report(e)} className="flex flex-col justify-center text-2xl">
    <label htmlFor="carrier">Carrier</label>
    <input type="text" name="carrier" id="carrier" className="border-b-2 border-blue-800 outline-none rounded-t-md mb-2" />
    <label htmlFor="seats">Number of seats</label>
    <input type="number" name="seats" id="seats" className="border-b-2 border-blue-800 outline-none rounded-t-md mb-2" />
    <select name="bus_class" id="bus_class" className="border-b-2 border-blue-800">
        {busClasses}
    </select>
    
    <button type="submit" className="p-2 mt-2 bg-blue-800 text-white rounded-lg">Create</button>
  </form> );
}

export default CreateBusForm;