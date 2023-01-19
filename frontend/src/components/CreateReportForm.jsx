import axios from "axios"
import { useSelector, useDispatch } from "react-redux";
import { login, logout } from "../redux/user/userActions";
import { useEffect, useState } from "react";
import { json, useNavigate } from "react-router-dom";
function CreateReportForm({id}) {
    const logedUser = JSON.parse(localStorage.getItem("user"))
    const headers = {Authorization: "Token "+logedUser?.token, "Content-Type":"application/json"}
 

    let report = (e)=>{
        e.preventDefault()
        const fData = new FormData(e.target)
        const body={route:id, content:fData.get("content"), issue:fData.get("issue")}
        console.log()
        axios.post("http://127.0.0.1:3004/report/create", {route:id, content:fData.get("content"), issue:fData.get("issue")}, {headers}).then(res=>{
            console.log(res)
            window.location.reload()
        })
          }
        
    
    return ( <form onSubmit={e=>report(e)} className="flex flex-col justify-center text-2xl">
    <label htmlFor="content">Content</label>
    <input type="text" name="content" id="content" className="border-b-2 border-blue-800 outline-none rounded-t-md mb-2" />
    <label htmlFor="issue">Issue</label>
    <input type="checkbox" name="issue" id="issue" className="border-b-2 border-blue-800 outline-none rounded-t-md mb-2" />
    <button type="submit" className="p-2 bg-blue-800 text-white rounded-lg">Report</button>
  </form> );
}

export default CreateReportForm;