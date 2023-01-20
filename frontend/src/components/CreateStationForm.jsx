import axios from "axios"
function CreateStationForm() {
    const user = JSON.parse(localStorage.getItem("user"))
    const headers = {Authorization: "Token "+user?.token, "Content-Type":"application/json"}
    const createStation = (e)=>{
        e.preventDefault()
        const fdata = new FormData(e.target)
        const sdata={
            name:fdata.get("name"),
            country:fdata.get("country")
        }
        axios.post("http://127.0.0.1:3001/station/create", sdata, {headers} ).then(res=>{
            console.log(res)
            window.location.reload()
        })
    }
    return ( 
    <form onSubmit={createStation} className="flex flex-col justify-center text-2xl">
        <label htmlFor="name">Name</label>
        <input type="text" name="name" id="name" className="border-b-2 border-blue-800 outline-none rounded-t-md" />
        <label htmlFor="username">Country</label>
        <input type="text" name="country" id="country" className="border-b-2 border-blue-800 outline-none rounded-t-md" />
        <button type="submit" className="p-2 bg-blue-800 text-white rounded-lg mt-2">Create</button>
    </form>);

}

export default CreateStationForm;