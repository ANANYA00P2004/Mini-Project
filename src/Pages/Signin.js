import React, { useState } from "react";
import { auth, googleProvider, signInWithEmailAndPassword, signInWithPopup } from "../firebaseConfig";
import { FaGoogle } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import "./Signin.css"

const SignInPage = () => {
  const [email, setEmail] = useState("");  // Changed 'username' to 'email'
  const [password, setPassword] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);  // Changed 'username' to 'email'
    else if (name === "password") setPassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);  // Changed 'username' to 'email'
      alert("Sign-in successful!");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert("Signed in with Google!");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="signin-container">
      {/* Left Section - Background Image */}
      <div className="signin-background">
      
        <div className="signin-overlay"><h2 className="text1">Welcome back!!</h2>
        <p className="text2">Enter the future of payments today:)</p></div>
      </div>

      {/* Right Section - Login Form */}
      <div className="signin-form">
        <div className="signin-card">
          <div className="right-side">
          <h3 className="signin-title">LOGIN</h3>
          </div>
          

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              className="signin-input"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              className="signin-input"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
            <button type="submit" className="signin-btn">Sign In</button>
          </form>

          <div className="signin-divider">Or sign in with</div>

          {/* Google Sign-In Button */}
          <button onClick={handleGoogleSignIn} className="btn-google">
            <img alt="Google Logo" src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" height="30px" width="30px" />
            Sign in with Google
          </button>

          <p className="signin-footer">
            Don't have an account? <a href="./sign-up">Sign up here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;