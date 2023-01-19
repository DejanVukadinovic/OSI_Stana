import Modal from "react-modal"
import RegisterForm from "./RegisterForm";
import { useState, useEffect } from "react";
import axios from "axios";
import CreateReportForm from "./CreateReportForm";

function RouteCard({data}) {
    const [IsOpen, setIsOpen] = useState(false)
    const [modalForm, setmodalForm] = useState(<></>)
    const [drivers, setdrivers] = useState([])
    const [buses, setBuses] = useState([])
    const logedUser = JSON.parse(localStorage.getItem("user"))
    const headers = {Authorization: "Token "+logedUser?.token, "Content-Type":"application/json"}
    
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
    const assginDriver = e =>{
        e.preventDefault()
        const fData = new FormData(e.target)
        const sdata = {
            iddriver:fData.get("driver")
        }
        console.log("assgining Drivers", {idstation:data.idroute, ...sdata})
        axios.post("http://127.0.0.1:3001/route/set_driver", {idroute:data.idroute, ...sdata}, {headers})
    }
    const assignBus = e =>{
        e.preventDefault()
        const fData = new FormData(e.target)
        const sdata = {
            bus:fData.get("bus")
        }
        console.log("assgining Buses", sdata)
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
    const openButModal = (e)=>{
        console.log(data.idroute)
        setmodalForm(<form onSubmit={e=>buyTicket(e)} className="flex flex-col justify-center text-2xl">
        <label htmlFor="name">Number of tickets</label>
            <select name="nTickets" id="nTickets" className="my-2">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
            </select>
            <button type="submit" className="p-2 bg-blue-800 text-white rounded-lg">Buy</button>
        </form>)
        setIsOpen(true)
    }
    const openDriverModal = (e)=>{
        console.log(data.idroute)
        axios.get("http://127.0.0.1:3002/list/drivers", {headers}).then(res=>{
            const tmpDrivers = res.data.map(el=><option value={el.iddriver}>{el.username}</option>)
            setdrivers(tmpDrivers)
            console.log(tmpDrivers, drivers)
        })
        
    }
    const openBusModal = (e)=>{
        console.log(data.idroute)
        axios.get("http://127.0.0.1:3001/bus/list", {headers}).then(res=>{
            const tmpBuses = res.data.map(el=><option value={el.idbus}>{el.carrier} Mjesta:{el.seats}</option>)
            setBuses(tmpBuses)
            console.log(tmpBuses, buses)
        })
        
    }
    const openReportModal = (e)=>{
        setmodalForm(<CreateReportForm id={data.idroute}/>)
        setIsOpen(true)
    }
    useEffect(() => {
        if(drivers.length){

            setmodalForm(<form onSubmit={e=>assginDriver(e)} className="flex flex-col justify-center text-2xl">
        <label htmlFor="name">Driver</label>
            <select name="driver" id="driver" className="my-2">
                <option value="-">-</option>
                {drivers}
            </select>
            <button type="submit" className="p-2 bg-blue-800 text-white rounded-lg">Assign</button>
        </form>)
        setIsOpen(true)
    }
    }, [drivers])

    useEffect(() => {
        if(buses.length){

            setmodalForm(<form onSubmit={e=>assignBus(e)} className="flex flex-col justify-center text-2xl">
        <label htmlFor="name">Bus:</label>
            <select name="bus" id="bus" className="my-2">
                <option value="-">-</option>
                {buses}
            </select>
            <button type="submit" className="p-2 bg-blue-800 text-white rounded-lg">Assign</button>
        </form>)
        setIsOpen(true)
    }
    }, [buses])
    
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
            {logedUser?.user_type==2?
            <a className="bg-blue-800 rounded-md p-2 text-white text-center cursor-pointer" onClick={e=>openButModal(e)}>Buy</a>
            :logedUser?.user_type==0?
            <div className="flex flex-col gap-2">
            <a className="bg-blue-800 rounded-md p-2 text-white text-center cursor-pointer" onClick={e=>openDriverModal(e)}>Assign driver</a>
            <a className="bg-blue-800 rounded-md p-2 text-white text-center cursor-pointer" onClick={e=>openBusModal(e)}>Assign bus</a>
            </div>
            :<a className="bg-blue-800 rounded-md p-2 text-white text-center cursor-pointer" onClick={e=>openReportModal(e)}>Add report</a>
            }
        </div>
        <Modal
            isOpen={IsOpen}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Example Modal"
            >
            {modalForm}
            <button onClick={closeModal} className="bg-red-600 py-2 px-6 mt-2 text-white w-full rounded-md text-2xl">Cancel</button>
        </Modal>
    </div>
     );
}

export default RouteCard;