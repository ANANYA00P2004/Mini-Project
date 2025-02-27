// signin.js (React Frontend)

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import "./Signin.css";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      alert("Signed in successfully!");
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/home" },
      });
      if (error) throw error;
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-background">
        <div className="signin-overlay">
          <h2 className="text1">Welcome back!!</h2>
          <p className="text2">Enter the future of payments today :)</p>
        </div>
      </div>

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
            <button type="submit" className="signin-btn">
              Sign In
            </button>
          </form>

          <div className="signin-divider">Or sign in with</div>

          <button onClick={handleGoogleSignIn} className="btn-google">
            <img
              alt="Google Logo"
              src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png"
              height="30px"
              width="30px"
            />
            Sign in with Google
          </button>

          <p className="signin-footer">
            Don't have an account? <a href="/sign-up">Sign up here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
