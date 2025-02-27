
import React, { useState } from "react";
import supabase from "../supabaseClient";

import { FaGoogle } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";
import "./Signin.css";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    else if (name === "password") setPassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) alert("Login successful!");
      else alert(data.error);
    } catch (error) {
      alert("Login failed!");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
        const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });

        if (error) {
            alert(error.message);
        } else {
            alert("Redirecting to Google authentication...");

            // Wait for authentication to complete
            supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === "SIGNED_IN" && session) {
                    const user = session.user;

                    // Check if user already exists in the database
                    const { data: existingUser, error: fetchError } = await supabase
                        .from("Users")
                        .select("*")
                        .eq("email", user.email)
                        .single();

                    if (fetchError && fetchError.code !== "PGRST116") {
                        console.error("Error fetching user:", fetchError);
                        return;
                    }

                    // If user does not exist, insert into the Users table
                    if (!existingUser) {
                        const { error: insertError } = await supabase
                            .from("Users")
                            .insert([{ name: user.user_metadata.full_name, email: user.email, password: null }]);

                        if (insertError) {
                            console.error("Error inserting user:", insertError);
                        }
                    }
                }
            });
        }
    } catch (error) {
        alert(error.message);
    }
};


  return (
    <div className="signin-container">
      <div className="signin-background">
        <div className="signin-overlay">
          <h2 className="text1">Welcome back!!</h2>
          <p className="text2">Enter the future of payments today:)</p>
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
            Don't have an account? <a href="./sign-up">Sign up here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;