import axios from "axios"
import { useSelector, useDispatch } from "react-redux";
import { login, logout } from "../redux/user/userActions";
import { useEffect, useState } from "react";
import { json, useNavigate } from "react-router-dom";
function CreateBusclassForm({id}) {
    const logedUser = JSON.parse(localStorage.getItem("user"))
    const headers = {Authorization: "Token "+logedUser?.token, "Content-Type":"application/json"}

    const [busClasses, setbusClasses] = useState([])
    
    
    let submit = (e)=>{
        e.preventDefault()
        const fData = new FormData(e.target)
        const body = {}
        for (const [name,value] of fData) {
            body[name]=value;
        }
        console.log()
        axios.post("http://127.0.0.1:3001/bus_class", body, {headers}).then(res=>{
            console.log(res)
            window.location.reload()
        })
          }
        
    
    return ( <form onSubmit={e=>submit(e)} className="flex flex-col justify-center text-2xl">
    <label htmlFor="description">Description</label>
    <input type="text" name="description" id="description" className="border-b-2 border-blue-800 outline-none rounded-t-md mb-2" />
    <label htmlFor="price_coefficient">Price coefficient</label>
    <input type="text" name="price_coefficient" id="price_coefficient" className="border-b-2 border-blue-800 outline-none rounded-t-md mb-2" />
    <button type="submit" className="p-2 bg-blue-800 text-white rounded-lg">Create</button>
  </form> );
}

export default CreateBusclassForm;