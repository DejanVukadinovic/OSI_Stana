import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Footer from "./Footer";
import Navbar from "./Navbar";
import UserCard from "./UserCard";
import Modal from "react-modal"
import RegisterForm from "./RegisterForm";

function UserList() {
    const user = JSON.parse(localStorage.getItem("user"))
    const headers = {Authorization: "Token "+user?.token, "Content-Type":"application/json"}
    const [displayUsers, setdisplayUsers] = useState([])
    const [IsOpen, setIsOpen] = useState(false)
    const [regType, setregType] = useState("admin")
    const [listType, setlistType] = useState(useSelector(state=>state.display.displayUserType)??"")
    useEffect(() => {
        axios.get("http://127.0.0.1:3002/list"+listType, {headers}).then(res=>{
        console.log(res.data)
        const users = res.data.map(el=><UserCard user={el}/>)
        setdisplayUsers(users)
        })
       
    }, [listType])
    
    const customStyles = {
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
        },
      };
    Modal.setAppElement('#root');
    function openAdminModal() {
        setIsOpen(true);
        setregType("admin")
      }
    function openDriverModal() {
      setIsOpen(true);
      setregType("driver")
    }

    function afterOpenModal() {
      
    }

    function closeModal() {
      setIsOpen(false);
    }
    const typeChange = (e)=>{
        setlistType("/"+e.target.value)
    }
    
    return (
    <div className="flex flex-col gap" style={{minHeight:"100vh"}}>
        <Navbar/>
        <div className="flex-grow flex flex-col gap-2 p-2">
            <div className="flex justify-between gap-2 ml-2">
                <div>
                    <label htmlFor="typeFilter" className="">Account type: </label>
                    <select name="typeFilter" id="typeFilter" onChange={e=>typeChange(e)} className="border-b-2 border-blue-800">
                        <option value="">-</option>
                        <option value="drivers">Driver</option>
                        <option value="passengers">Passenger</option>
                    </select>
                </div>
                <div className="flex gap-2">
                <button onClick={openAdminModal} className="bg-blue-800 text-white p-2 rounded-md">New admin</button>
                <button onClick={openDriverModal} className="bg-blue-800 text-white p-2 rounded-md">New driver</button>
                </div>
            </div>
            {displayUsers}
        </div>
        <Footer/>
        <Modal
            isOpen={IsOpen}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Example Modal"
            >
            <RegisterForm type={regType}/>
            <button onClick={closeModal} className="bg-red-600 py-2 px-6 mt-2 text-white w-full rounded-md text-2xl">Cancel</button>
        </Modal>
    </div> );
}

export default UserList;