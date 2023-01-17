import Modal from "react-modal"
import RegisterForm from "./RegisterForm";
import { useEffect, useState } from "react";
import CreateStationForm from "./CreateStationForm";
function StationAdminBar() {
    const [IsOpen, setIsOpen] = useState(false)
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
      }
    
    function afterOpenModal() {
      
    }

    function closeModal() {
      setIsOpen(false);
    }
    return (
    <>
        <div className="px-4 py-4 flex justify-end ">
            <button className="bg-blue-800 py-2 px-4 rounded-md text-white" onClick={openModal}>Add station</button>
        </div>
        <Modal
            isOpen={IsOpen}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Example Modal"
            >
            <CreateStationForm/>
            <button onClick={closeModal} className="bg-red-600 py-2 px-6 mt-2 text-white w-full rounded-md text-2xl">Cancel</button>
        </Modal>
    </>  );
}

export default StationAdminBar;