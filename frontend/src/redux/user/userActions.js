import { LOGIN, LOGOUT } from "./userTypes";

export const login = (data = {})=>{
    return {
        type: LOGOUT,
        payload: data
    }
}

export const logout = ()=>{
    return {
        type: LOGOUT,
        payload: {}
    }
}