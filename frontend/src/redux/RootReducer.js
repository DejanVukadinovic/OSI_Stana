import {combineReducers} from "redux";
import exampleReducer from "./example/exampleReducer";
import userReducer from "./user/userReducer";

const rootReducer = combineReducers({
	example: exampleReducer,
	user: userReducer
});

export default rootReducer;
