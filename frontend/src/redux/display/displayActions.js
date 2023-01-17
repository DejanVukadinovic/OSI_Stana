import { DISPLAY_USER_TYPE } from "./displayTypes";

export const displayUserType = (data = "")=>{
    return {
        type: DISPLAY_USER_TYPE,
        payload: data
    }
}
