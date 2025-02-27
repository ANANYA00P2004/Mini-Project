
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "../Pages/Signup.css";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") setName(value);
    else if (name === "email") setEmail(value);
    else if (name === "password") setPassword(value);
    else if (name === "confirmPassword") setConfirmPassword(value);
  };

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return regex.test(password);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (!validatePassword(password)) {
      alert(
        "Password must have at least 1 uppercase, 1 lowercase, 1 number, 1 special character, and be at least 6 characters long."
      );
      return;
    }

    try {
      // Sign up the user with Supabase authentication
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (error) throw error;

      alert("Sign-up successful! Storing user in database...");

      // Send user data to backend to store in Users table
      const userData = { name, email, password };

      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("User signed up successfully and stored in database!");
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert(error.message);
    }
  };
//edited by ananya
const handleGoogleSignIn = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) throw error;
    alert("Redirecting to Google authentication...");

    // Wait to ensure authentication completes
    setTimeout(async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session Fetch Error:", sessionError);
        throw sessionError;
      }

      const user = sessionData.session?.user;
      console.log("Supabase Auth User:", user); // ✅ Debugging

      if (!user) {
        alert("Google authentication failed. Please try again.");
        return;
      }

      // Send user details to backend to store in database
      const response = await fetch("http://localhost:5000/google-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.user_metadata?.full_name || "Unknown",
          email: user.email,
        }),
      });

      const result = await response.json();
      console.log("Backend Response:", result); // ✅ Debugging

      if (response.ok) {
        alert("Data entered into Users table successfully!");
      } else {
        alert(result.error);
      }
    }, 3000);
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    alert(error.message);
  }
};

  
  return (
    <div className="main-signup">
      <div className="signup-container">
        <h2>Sign Up</h2>
        <form className="signup-form" onSubmit={handleSignup}>
          <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />
          <button type="submit">Sign Up</button>
        </form>
        <button onClick={handleGoogleSignIn} className="btn-google-signup">
          <img
            alt="Google Logo"
            src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png"
            height="30px"
            width="30px"
            style={{ marginRight: "8px" }}
          />
          Sign up with Google
        </button>
      </div>
    </div>
  );
};

export default SignUp;