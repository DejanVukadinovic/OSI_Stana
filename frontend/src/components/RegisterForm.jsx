import axios from "axios"
function RegisterForm() {
    let register = (e)=>{
        e.preventDefault()
        const data = new FormData(e.target);
        const params = {user_type:"passenger"}
        for (const [name,value] of data) {
            console.log(name, ":", value)
            params[name]=value;
          }
        axios.get("http://127.0.0.1:3002/register", {params}).then(res=>{
          console.log(res)
        })
        
        }
    return (  <form onSubmit={register} className="flex flex-col justify-center text-2xl">
    <label htmlFor="name">Name</label>
    <input type="text" name="name" id="name" className="border-b-2 border-blue-800 outline-none rounded-t-md" />
    <label htmlFor="username">Username</label>
    <input type="text" name="username" id="username" className="border-b-2 border-blue-800 outline-none rounded-t-md" />
    <label htmlFor="password">Password</label>
    <input type="password" name="password" id="password" className="border-b-2 border-blue-800 outline-none mb-2 rounded-t-md" />
    <button type="submit" className="p-2 bg-blue-800 text-white rounded-lg">Register</button>
  </form>);
}

export default RegisterForm;