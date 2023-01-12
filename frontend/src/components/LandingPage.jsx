import LoginForm from './LoginForm';
import { useState } from 'react';
import RegisterForm from './RegisterForm';
function LandingPage() {
    const [Form, setForm] = useState(true)

    const changeFrom = (e)=>{
        e.preventDefault();
        console.log("Whatever")
        setForm(!Form)
    }


  return (
    <div className="flex flex-col px-4" style={{height:"100vh"}} >
      <div id="navbar" className="border-b-4 border-blue-800 text-xl px-4 py-2">
        <div className="flex justify-between align-baseline">
          <h3 className="font-bold text-3xl">Bus++</h3>
          <h3 className="text-l mt-auto">About us</h3>
        </div>
      </div>
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
      <div id="footer" className="border-t-4 border-blue-800 px-4 py-2">
        <h3 className="text-center">By: Stana</h3>
      </div>
    </div>
  );
}

export default LandingPage;
