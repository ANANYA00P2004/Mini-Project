import React from 'react';
import './App.css';
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import SignIn from './Pages/Signin';
import SignUp from './Pages/Signup'
function App() {
  return (
    <BrowserRouter>
    <Routes>
    <Route path="/sign-in" element={<SignIn/>} />
    <Route path="/sign-up" element={<SignUp/>} />
    </Routes>
    </BrowserRouter>
    
  );
}

export default App;
