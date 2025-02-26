import React, { useState } from "react";
import { auth, googleProvider, createUserWithEmailAndPassword, signInWithPopup } from "../firebaseConfig";
import { FaGoogle } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css"

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "username") setUsername(value);
    else if (name === "email") setEmail(value);
    else if (name === "password") setPassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Sign-up successful!");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert("Logged in with Google!");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="container-fluid vh-100 signup-container">
      <div className="row h-100">
        {/* Left Section - Welcome Text */}
        <div className="col-lg-6 d-none d-lg-flex gradient-background position-relative align-items-center justify-content-center">
          <div className="curved-background"></div>
          <div className="welcome-text text-white text-center position-relative">
            <h2 className="display-4 fw-bold mb-4">Welcome to Wyzo!</h2>
            <p className="lead">Enter your personal details to sign up to Wyzo, The Ultimate Financial Tracker.</p>
            </div>
        </div>

        {/* Right Section - Sign Up Form */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center">
          <div className="card shadow-lg p-5 form-card">
            <h2 className="text-center mb-4">Create an Account</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  name="username"
                  placeholder="Username"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  placeholder="Email address"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 mb-3">
                Sign up
              </button>
            </form>

            {/* Google Sign-In Button */}
            <div className="text-center mb-3">
              <span className="text-muted">Or continue with</span>
            </div>
            <button
              onClick={handleGoogleSignIn}
              className="btn btn-google w-100 d-flex align-items-center justify-content-center"
            >
              <img alt="Google Logo" src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" height="30px" width="30px" />
              Sign up with Google
            </button>

            {/* Login Link */}
            <p className="text-center mt-3">
              Already have an account?{" "}
              <a href="./sign-in" className="text-primary">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
