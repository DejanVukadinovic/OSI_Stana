import {combineReducers} from "redux";
import displayReducer from "./display/displayReducer";
import exampleReducer from "./example/exampleReducer";
import userReducer from "./user/userReducer";

const rootReducer = combineReducers({
	example: exampleReducer,
	user: userReducer,
	display: displayReducer
});

export default rootReducer;
