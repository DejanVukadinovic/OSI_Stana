import { LOGIN, LOGOUT } from "./userTypes";

const initial = {}

const userReducer = (state = initial, action)=>{
    switch(action.type){
        case LOGIN:{
            return{
                ...state,
                user:action.payload
            }
        }
        case LOGOUT:{
            return{
                ...state,
                user:action.payload
            }
        }
        default: 
            return state
    }
}
export default userReducer