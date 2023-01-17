import Modal from "react-modal"
import RegisterForm from "./RegisterForm";
import { useState } from "react";
import axios from "axios";

function RouteCard({data}) {
    const [IsOpen, setIsOpen] = useState(false)
    const logedUser = JSON.parse(localStorage.getItem("user"))
    const headers = {Authorization: "Token "+logedUser?.token, "Content-Type":"application/json"}
    const openButModal = (e)=>{
        console.log(data.idroute)
        setIsOpen(true)
    }
    const buyTicket = e =>{
        e.preventDefault()
        const fData = new FormData(e.target)
        const sdata = {
            route: data.idroute,
            nTickets : parseInt(fData.get("nTickets"))
        }
        console.log(sdata)
        axios.post("http://127.0.0.1:3003/ticket/create", sdata, {headers} ).then(res=>{
            console.log(res.data.ticket[0].idticket)
            setTimeout(()=>window.open(`http://127.0.0.1:3003/pdf/ticket-${res.data.ticket[0].idticket}.pdf`, "_blank"), 500)
            
            closeModal()
        })
    }
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

    function afterOpenModal() {
      
    }

    function closeModal() {
      setIsOpen(false);
    }
    return ( 
        <div className="p-4 border-2 border-blue-800 rounded-md flex justify-between">
        <div>
        <div>{data.name}</div>
        <div>{data.date}</div>
        <div>{data.time}</div>
        <div>{data.duration}H</div>    
        </div>
        <div className="flex flex-col justify-center">
            <div>
            {data.price}
            KM
            </div>
            <a className="bg-blue-800 rounded-md p-2 text-white text-center cursor-pointer" onClick={e=>openButModal(e)}>Buy</a>
        </div>
        <Modal
            isOpen={IsOpen}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Example Modal"
            >
            <form onSubmit={e=>buyTicket(e)} className="flex flex-col justify-center text-2xl">
                <label htmlFor="name">Number of tickets</label>
                <select name="nTickets" id="nTickets" className="my-2">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                </select>
                <button type="submit" className="p-2 bg-blue-800 text-white rounded-lg">Buy</button>
            </form>
            <button onClick={closeModal} className="bg-red-600 py-2 px-6 mt-2 text-white w-full rounded-md text-2xl">Cancel</button>
        </Modal>
    </div>
     );
}

export default RouteCard;