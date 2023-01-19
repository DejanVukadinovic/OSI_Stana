import axios from "axios"

function TicketCard({ticket}) {
    const logedUser = JSON.parse(localStorage.getItem("user"))
    const headers = {Authorization: "Token "+logedUser?.token, "Content-Type":"application/json"}
    const url = `http://127.0.0.1:3003/pdf/ticket-${ticket.idticket}.pdf`

    return (
    <div className="p-4 border-2 border-blue-800 rounded-md flex justify-between">
        <div>
        <div>{ticket.name}</div>
        <div>{ticket.time.split("T")[0]}</div>
        <div>{ticket.time.split("T")[1].slice(0,-5)}</div>
        </div>
        <div>
            <div>{ticket.price}KM</div>
            <a href={url} target="_blank">View ticket</a>
        </div>
    </div> );
}

export default TicketCard;