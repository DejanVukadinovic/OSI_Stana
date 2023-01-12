import {combineReducers} from "redux";
import exampleReducer from "./example/exampleReducer";

const rootReducer = combineReducers({
	example: exampleReducer,
});

export default rootReducer;
