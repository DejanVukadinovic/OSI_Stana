import axios from "axios"
function StationCard({data}) {
    const logedUser = JSON.parse(localStorage.getItem("user"))
    const headers = {Authorization: "Token "+logedUser?.token, "Content-Type":"application/json"}

    const deleteStation = e=>{
        e.preventDefault()
        axios.put("http://127.0.0.1:3001/station/delete", {idstation:data.idstation}, {headers}).then(res=>{
            window.location.reload()
        })

    }
    return ( 
        <div className="p-4 border-2 border-blue-800 rounded-md flex justify-between">
        <div className="flex flex-col">

        <div>{data.name}</div>
        <div>{data.country}</div>
        </div>
        <div>

        {logedUser.user_type="admin"?<button onClick={deleteStation} className="bg-red-600 text-white text-cente p-2 rounded-md">Delete</button>:""}
        </div>
        
    </div>
     );
}

export default StationCard;