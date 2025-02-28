import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "../Pages/Signin.css";
import { useNavigate } from "react-router-dom";

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
    else if (name === "password") setPassword(value);
  };
  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from("Users").select("*").eq("email", email);
      if (data.length === 0) {
        alert("User not found. Please sign up first.");
        return;
      }
      const { user, session, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      alert("Login successful!");
      navigate("/home");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const { user, error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) {
      alert(error.message);
    } else {
      const { data } = await supabase.from("Users").select("*").eq("email", user.email);
      if (data.length === 0) {
        alert("User not found. Please sign up first.");
        return;
      }
      alert("Login successful!");
      navigate("/home");
    }
  };

  // const handleSignIn = async (e) => {
  //   e.preventDefault();

  //   try {
  //     // Authenticate with Supabase
  //     const { data, error } = await supabase.auth.signInWithPassword({
  //       email,
  //       password,
  //     });

  //     if (error) throw error;

  //     alert("Sign-in successful!");

  //     // Send sign-in request to backend for verification
  //     const response = await fetch("http://localhost:5000/signin", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email, password }),
  //     });

  //     const result = await response.json();
  //     if (response.ok) {
  //       alert("User authenticated successfully!");
  //     } else {
  //       alert(result.error);
  //     }
  //   } catch (error) {
  //     alert(error.message);
  //   }
  // };

  // const handleGoogleSignIn = async () => {
  //   try {
  //     const { data, error } = await supabase.auth.signInWithOAuth({
  //       provider: "google",
  //     });

  //     if (error) throw error;
  //     alert("Redirecting to Google authentication...");

      // Check when the user is authenticated
      // supabase.auth.onAuthStateChange(async (event, session) => {
      //   if (event === "SIGNED_IN" && session) {
      //     const user = session.user;

          // Send user details to backend to check/store in database
  //         const response = await fetch("http://localhost:5000/google-auth", {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({
  //             name: user.user_metadata?.full_name || "Unknown",
  //             email: user.email,
  //           }),
  //         });

  //         const result = await response.json();
  //         if (response.ok) {
  //           alert("Logged in with Google and verified in database!");
  //         } else {
  //           alert(result.error);
  //         }
  //       }
  //     });
  //   } catch (error) {
  //     alert(error.message);
  //   }
  // };

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

          {/* FIXED: Corrected form onSubmit reference */}
          <form onSubmit={handleSignIn}>
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
