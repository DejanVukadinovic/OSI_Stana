import axios from "axios"
function LoginForm() {
    let login = (e)=>{
        e.preventDefault()
        const data = new FormData(e.target);
        
        axios.get(`http://localhost:3002/login?username=${data.get("username")}&password=${data.get("password")}`, 
        {}).then(res=>console.log(res))
        }
    return ( <form onSubmit={login} className="flex flex-col justify-center text-2xl">
    <label htmlFor="username">Username</label>
    <input type="text" name="username" id="username" className="border-b-2 border-blue-800 outline-none rounded-t-md" />
    <label htmlFor="password">Password</label>
    <input type="password" name="password" id="password" className="border-b-2 border-blue-800 outline-none mb-2 rounded-t-md" />
    <button type="submit" className="p-2 bg-blue-800 text-white rounded-lg">Log in</button>
    
  </form> );
}

export default LoginForm;