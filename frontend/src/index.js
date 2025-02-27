import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import SignIn from "./Pages/Signin";
import SignUp from "./Pages/Signup";
import Expenses from "./Pages/Expenses";
import BudgetPlan from "./Pages/BudgetPlan";
import Home from "./Pages/Home"
// import Wishlist from "./Pages/Wishlist";
import FutureEvents from "./Pages/FutureEvent";

const Root = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/plan" element={<BudgetPlan />} />
        <Route path="/futureevents" element={<FutureEvents />} /> 
        <Route path="/home" element={<Home/>}/>
        {/* <Route path="/wishlist" element={<Wishlist />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Root />);
