import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { logout } from "../redux/user/userActions";
import { useNavigate } from "react-router";
function Navbar() {
    const user = useSelector(state=>state.user.user) ?? {}
    const islogedin = useSelector(state=>state.user?.user?.login) ?? false
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const flogout = e =>{

        dispatch(logout())
        navigate("/")
    }
    useEffect(() => {
      console.log(islogedin)
    }, [user])
    
    return ( 
    <div id="navbar" className="border-b-4 border-blue-800 text-xl px-4 py-2">
      <div className="flex justify-between align-baseline">
        <h3 className="font-bold text-3xl">Bus++</h3>
        <div className="flex">
        <h3 className="text-l mt-auto  pr-2">About us</h3>
        {islogedin?<a className="text-l mt-auto pl-2 cursor-pointer border-l-2 border-blue-800" onClick={flogout}>Log out</a>:""}
        </div>
      </div>
    </div> );
}

export default Navbar;