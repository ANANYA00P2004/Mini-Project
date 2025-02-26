import React from 'react';
import './App.css';
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import SignIn from './Pages/Signin';
import SignUp from './Pages/Signup'
import Expenses from './Pages/Expenses'
import BudgetPlan from './Pages/BudgetPlan/BudgetPlan'
function App() {
  return (
    <BrowserRouter>
    <Routes>
    <Route path="/sign-in" element={<SignIn/>} />
    <Route path="/sign-up" element={<SignUp/>} />
    <Route path ="/expenses" element={<Expenses/>} />
    <Route path = "/plan" element={<BudgetPlan/>} />
    </Routes>
    </BrowserRouter>
    
  );
}

export default App;
