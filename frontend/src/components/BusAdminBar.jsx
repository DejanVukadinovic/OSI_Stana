import Modal from "react-modal"
import RegisterForm from "./RegisterForm";
import { useEffect, useState } from "react";
import CreateStationForm from "./CreateStationForm";
import CreateRouteForm from "./CreateRouteForm";
import CreateBusForm from "./CreateBusForm";
import CreateBusclassForm from "./CreateBusclassForm";
function BusAdminBar() {
    const user = JSON.parse(localStorage.getItem("user")) ?? {}
    const [IsOpen, setIsOpen] = useState(false)
    const [modalContent, setmodalContent] = useState()
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
    function openModal() {
        setIsOpen(true);
        setmodalContent(<CreateBusForm/>)
      }
    
    function afterOpenModal() {
      
    }

    function closeModal() {
      setIsOpen(false);
    }
    function openClassModal() {
        setmodalContent(<CreateBusclassForm/>)
        setIsOpen(true);
      }
    return (
        
    <>{user?.user_type==0?
    <>
    <div className="px-4 py-4 flex justify-end gap-2 ">
            <button className="bg-blue-800 py-2 px-4 rounded-md text-white" onClick={openModal}>Add bus</button>
            <button className="bg-blue-800 py-2 px-4 rounded-md text-white" onClick={openClassModal}>Add bus class</button>
        </div>
        <Modal
            isOpen={IsOpen}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Example Modal"
            >
            {modalContent}
            <button onClick={closeModal} className="bg-red-600 py-2 px-6 mt-2 text-white w-full rounded-md text-2xl">Cancel</button>
        </Modal>
    </>:""}
        
    </>  );
}

export default BusAdminBar;