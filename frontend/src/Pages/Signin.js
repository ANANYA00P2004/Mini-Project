import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import "../Pages/Signin.css";

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

  // Handle sign-in with email and password
  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      // Fetch user ID from database
      const { data, error } = await supabase
        .from("Users")
        .select("id")
        .eq("email", email)
        .single();

      if (error || !data) {
        alert("User not found. Please sign up first.");
        return;
      }

      // Authenticate user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Store user ID in localStorage
      localStorage.setItem("userId", data.id);

      alert("Login successful!");
      navigate("/home");
    } catch (error) {
      alert(error.message);
    }
  };

  // Handle Google sign-in
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/sign-in",
      },
    });

    if (error) {
      console.error("Google Sign-In Error:", error);
    } else {
      localStorage.setItem("googleSignInTriggered", "true"); // Track sign-in attempt
    }
  };

  // Fetch and check user after Google authentication
  const fetchAndCheckUser = async () => {
    const { data: userData, error } = await supabase.auth.getUser();

    if (error || !userData?.user) {
      console.error("Error fetching user data:", error);
      return;
    }

    const { email } = userData.user;

    // Check if user exists in database
    const { data: existingUser, error: checkError } = await supabase
      .from("Users")
      .select("id")
      .eq("email", email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking user in database:", checkError);
      return;
    }

    if (existingUser) {
      localStorage.setItem("userId", existingUser.id);
      alert("Login successful!");
      localStorage.removeItem("googleSignInTriggered");
      navigate("/home");
    } else {
      alert("User not found. Please sign up.");
      localStorage.removeItem("googleSignInTriggered");

      // Sign out unregistered user
      await supabase.auth.signOut();
      navigate("/sign-up");
    }
  };

  // Check if Google sign-in was triggered and verify user
  useEffect(() => {
    const signInTriggered = localStorage.getItem("googleSignInTriggered");
    if (signInTriggered) {
      fetchAndCheckUser();
    }
  }, []);

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

          <button onClick={signInWithGoogle} className="btn-google">
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
