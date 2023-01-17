import axios from "axios"
function CreateStationForm() {
    const createStation = (e)=>{
        e.preventDefault()
        const fdata = new FormData(e.target)
        console.log(fdata.get("name"), fdata.get("country"))
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