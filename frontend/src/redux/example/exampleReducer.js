// Example of REDUX reducer

import {INCREMENT, DECREMENT} from "./exampleTypes";

const initial = {
	counter: 0,
};
const exampleReducer = (state = initial, action) => {
	switch (action.type) {
		case INCREMENT:
			return {
				...state,
				counter: state.counter + action.payload,
			};
		case DECREMENT:
			return {
				...state,
				counter: state.counter - action.payload,
			};
		default:
			return state;
	}
};

export default exampleReducer;
