import axios from "axios"
import { useSelector, useDispatch } from "react-redux";
import { login, logout } from "../redux/user/userActions";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
function LoginForm() {
    const user = useSelector(state => state.user.user)
    const dispatch = useDispatch();
    const [error, seterror] = useState("")
    const navigate = useNavigate()

    let flogin = (e)=>{
        e.preventDefault()
        const data = new FormData(e.target);
        let params ={
          username:data.get("username"),
          password:data.get("password")
        }
        axios.get(`http://localhost:3002/login`, 
        {params}).then(res=>{
          if(!res.data.login){
            console.log("error: ", res.data)
            seterror(res.data)
          }else {
            seterror("")
            dispatch(login(res.data))
            navigate("/home")
          }})
          }
    
    return ( <form onSubmit={e=>flogin(e)} className="flex flex-col justify-center text-2xl">
    <label htmlFor="username">Username</label>
    <input type="text" name="username" id="username" className="border-b-2 border-blue-800 outline-none rounded-t-md" />
    <label htmlFor="password">Password</label>
    <input type="password" name="password" id="password" className="border-b-2 border-blue-800 outline-none mb-2 rounded-t-md" />
    {error?<div className="text-red-600 text-base text-center underline">{error}</div>:""}
    <button type="submit" className="p-2 bg-blue-800 text-white rounded-lg">Log in</button>
  </form> );
}

export default LoginForm;