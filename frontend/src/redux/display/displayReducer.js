import { DISPLAY_USER_TYPE } from "./displayTypes";

const initial = {}

const displayReducer = (state = initial, action)=>{
    switch(action.type){
        case DISPLAY_USER_TYPE:{
            return{
                ...state,
                displayUserType:action.payload
            }
        }
        default: 
            return state
    }
}
export default displayReducer