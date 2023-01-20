import React from "react";
import logo from "./logo.svg";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import HomePage from "./components/HomePage";
import LandingPage from "./components/LandingPage";
import {Provider} from "react-redux";
import store from "./redux/store";
import UserList from "./components/UserList";
import AboutPage from "./components/AboutPage";
import StationsList from "./components/StationsList";
import TicketHistory from "./components/TicketHistory";
import ReportList from "./components/ReportList";
import ListBuses from "./components/ListBuses";
import DiscountList from "./components/DiscountList";

function App() {
	return (
		<Provider store={store}>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<LandingPage />} />
					<Route path="/home" element={<HomePage />} />
					<Route path="/users" element={<UserList />} />
					<Route path="/about" element={<AboutPage />} />
					<Route path="/stations" element={<StationsList />} />
					<Route path="/tickets" element={<TicketHistory />} />
					<Route path="/reports" element={<ReportList />} />
					<Route path="/bus" element={<ListBuses />} />
					<Route path="/discounts" element={<DiscountList />} />
				</Routes>
			</BrowserRouter>
		</Provider>
	);
}

export default App;
