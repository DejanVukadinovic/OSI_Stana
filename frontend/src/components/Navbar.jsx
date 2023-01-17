import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { logout } from "../redux/user/userActions";
import { useNavigate } from "react-router";
function Navbar() {
    const user = JSON.parse(localStorage.getItem("user")) ?? {}
    const islogedin = user?.login ?? false
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const flogout = e =>{

        localStorage.setItem('user', "{}")
        dispatch(logout())
        navigate("/")
    }
    useEffect(() => {
      console.log(islogedin, user.user_type)
    }, [user])
    
    return ( 
    <div id="navbar" className="border-b-4 border-blue-800 text-xl px-4 py-2">
      <div className="flex justify-between align-baseline">
        <h3 className="font-bold text-3xl">Bus++</h3>
        <div className="flex">
        {islogedin?<a className="text-l mt-auto px-2 cursor-pointer border-l-2 border-blue-800" href="/home">Routes</a>:""}
          {(islogedin && !user?.user_type)?
          <>
          <a className="text-l mt-auto px-2 cursor-pointer border-l-2 border-blue-800" href="/users">Users</a>
          <a className="text-l mt-auto px-2 cursor-pointer border-l-2 border-blue-800" href="/stations">Stations</a>
          </>
          :""}
        <a className="text-l mt-auto px-2 cursor-pointer border-l-2 border-blue-800" href="/about">About us</a>
        {islogedin?<a className="text-l mt-auto pl-2 cursor-pointer border-l-2 border-blue-800" onClick={flogout}>Log out</a>:""}
        </div>
      </div>
    </div> );
}

export default Navbar;