import axios from "axios"

function UserCard({user}) {
    const logedUser = JSON.parse(localStorage.getItem("user"))
    const headers = {Authorization: "Token "+logedUser?.token, "Content-Type":"application/json"}
    const suspended = user.suspended ?? false;

    const suspend = (e)=>{
        e.preventDefault()
        console.log('suspending', user.username)
        if(suspend){
            axios.put("http://127.0.0.1:3002/activate",  {username:user.username}, {headers})
        .then(res=>{
            console.log(res)
        })
        }else{
            axios.put("http://127.0.0.1:3002/suspend",  {username:user.username}, {headers})
            .then(res=>{
                console.log(res)
            })
        }
        
    }

    return (
    <div className="p-4 border-2 border-blue-800 rounded-md flex justify-between">
        <div>
        <div>{user.name}</div>
        <div>@{user.username}</div>
        <div>Type: {user.user_type}</div>    
        </div>
        <div className="flex flex-col justify-center">
            {user.user_type!="admin"?suspended?<button className="bg-blue-800 text-white p-3 rounded-md" onClick={e=>suspend(e)}>Activate</button>:<button className="bg-red-600 text-white p-3 rounded-md" onClick={e=>suspend(e)}>Suspend</button>:""}
        </div>
    </div> );
}

export default UserCard;