import LoginForm from './LoginForm';
import { useState } from 'react';
import RegisterForm from './RegisterForm';
import Navbar from './Navbar';
import Footer from './Footer';
import axios from 'axios';
function LandingPage() {
    const [Form, setForm] = useState(true)

    const changeFrom = (e)=>{
        e.preventDefault();
        console.log("Whatever")
        setForm(!Form)
      }


  return (
    <div className="flex flex-col px-4" style={{height:"100vh"}} >
      <Navbar/>
      <div id="content" className="flex w-full  flex-1">
        <div id="logo" className="w-1/2 flex justify-center align-middle">
            <div className='m-auto flex' style={{border:"20px solid rgb(30, 64, 175)", fontSize:"10rem", borderRadius:"100%", padding:"1.5rem 3rem", fontWeight:900, alignItems:"center"}}>B<div style={{fontSize:"4rem"}}>++</div></div>
            {/* <img src={logo} alt="logo" className="" /> */}
        </div>
        <div id="login" className="w-full flex align-middle justify-center flex-1">
            <div className="flex flex-col justify-center">
            {Form? <LoginForm/>:<RegisterForm/>}

            <a href="#" className="text-base text-center text-blue-800 mt-2 underline"  onClick={changeFrom}>{Form?"Sign up":"Log in"}</a>
            </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default LandingPage;
