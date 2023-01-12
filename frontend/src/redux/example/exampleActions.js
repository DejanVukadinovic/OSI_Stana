//Example how to define REDUX actions

import {INCREMENT, DECREMENT} from "./exampleTypes";

export const increment = (num = 1) => {
	return {
		type: INCREMENT,
		payload: num,
	};
};

export const decrement = (num = 1) => {
	return {
		type: DECREMENT,
		payload: num,
	};
};
