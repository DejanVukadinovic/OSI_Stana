import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { logout } from "../redux/user/userActions";
import { useNavigate } from "react-router";
import Modal from "react-modal";
import axios from "axios";

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user")) ?? {};
  const headers = { Authorization: "Token " + user?.token, "Content-Type": "application/json" };

  const islogedin = user?.login ?? false;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [IsOpen, setIsOpen] = useState(false);
  const [error, seterror] = useState();

  const flogout = (e) => {
    localStorage.setItem("user", "{}");
    dispatch(logout());
    navigate("/");
  };
  const fPassChange = (e) => {
    e.preventDefault();
    const fData = new FormData(e.target);
    if (fData.get("password") == fData.get("repeat_password") && fData.get("password") && fData.get("repeat_password")) {
      axios.put("http://127.0.0.1:3002/password",
      { old_password: fData.get("old_password"), new_password: fData.get("password") },
      { headers })
      .then((res) => window.location.reload());
    }
  };

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
    },
  };
  useEffect(() => {
    console.log(islogedin, user.user_type);
  }, [user]);

  Modal.setAppElement("#root");
  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {}

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <div id="navbar" className="border-b-4 border-blue-800 text-xl px-4 py-2">
      <div className="flex justify-between align-baseline">
        <h3 className="font-bold text-3xl">Bus++</h3>
        <div className="flex">
          {islogedin ? (
            <a className="text-l mt-auto px-2 cursor-pointer border-l-2 border-blue-800" href="/home">
              Routes
            </a>
          ) : (
            ""
          )}
          {islogedin && !user?.user_type ? (
            <>
              <a className="text-l mt-auto px-2 cursor-pointer border-l-2 border-blue-800" href="/users">
                Users
              </a>
              <a className="text-l mt-auto px-2 cursor-pointer border-l-2 border-blue-800" href="/stations">
                Stations
              </a>
              <a className="text-l mt-auto px-2 cursor-pointer border-l-2 border-blue-800" href="/bus">
                Buses
              </a>
              <a className="text-l mt-auto px-2 cursor-pointer border-l-2 border-blue-800" href="/discounts">
                Discounts
              </a>
            </>
          ) : (
            ""
          )}
          {islogedin && user?.user_type == 2 ? (
            <>
              <a className="text-l mt-auto px-2 cursor-pointer border-l-2 border-blue-800" href="/tickets">
                Purchase History
              </a>
            </>
          ) : (
            ""
          )}
          {islogedin && (user?.user_type == 0 || user?.user_type == 1) ? (
            <>
              <a className="text-l mt-auto px-2 cursor-pointer border-l-2 border-blue-800" href="/reports">
                Reports
              </a>
            </>
          ) : (
            ""
          )}

          <a className="text-l mt-auto px-2 cursor-pointer border-l-2 border-blue-800" href="/about">
            About us
          </a>
          {islogedin ? (
            <a className="text-l mt-auto px-2 cursor-pointer border-l-2 border-blue-800" onClick={openModal}>
              Change password
            </a>
          ) : (
            ""
          )}
          {islogedin ? (
            <a className="text-l mt-auto pl-2 cursor-pointer border-l-2 border-blue-800" onClick={flogout}>
              Log out
            </a>
          ) : (
            ""
          )}
        </div>
      </div>
      <Modal isOpen={IsOpen} onAfterOpen={afterOpenModal} onRequestClose={closeModal} style={customStyles} contentLabel="Example Modal">
        <form onSubmit={(e) => fPassChange(e)} className="flex flex-col justify-center text-2xl">
          <label htmlFor="old_password">Old password</label>
          <input type="password" name="old_password" id="old_password" className="border-b-2 border-blue-800 outline-none rounded-t-md mb-2" />
          <label htmlFor="password">Password</label>
          <input type="password" name="password" id="password" className="border-b-2 border-blue-800 outline-none rounded-t-md mb-2" />
          <label htmlFor="repeat_password">Repeat password</label>
          <input type="password" name="repeat_password" id="repeat_password" className="border-b-2 border-blue-800 outline-none rounded-t-md mb-2" />
          <button type="submit" className="p-2 bg-blue-800 text-white rounded-lg">
            Report
          </button>
        </form>
        <button onClick={closeModal} className="bg-red-600 py-2 px-6 mt-2 text-white w-full rounded-md text-2xl">
          Cancel
        </button>
      </Modal>
    </div>
  );
}

export default Navbar;
