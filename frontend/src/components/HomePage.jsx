import React from "react";
import {useSelector, useDispatch} from "react-redux";
import {increment, decrement} from "../redux/example/exampleActions";


function HomePage() {
	const counter = useSelector((state) => state.example.counter);
	const dispatch = useDispatch();
	return (
		<divc className="">
			<h1 className="text-3xl font-bold underline text-center">Counter</h1>
			<div className="flex justify-center pt-4">
				<button
					className="border-2 border-black p-2 text-xl rounded-2xl hover:bg-black hover:text-white"
					onClick={(e) => {
						dispatch(increment());
					}}
				>
					Increase
				</button>
				<div className="text-2xl p-4 stroke-2 font-bold">{counter}</div>

				<button
					className="border-2 border-black p-2 text-xl rounded-2xl hover:bg-black hover:text-white"
					onClick={(e) => {
						dispatch(decrement());
					}}
				>
					Decrease
				</button>
			</div>
		</divc>
	);
}

export default HomePage;
