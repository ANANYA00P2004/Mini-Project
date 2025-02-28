import "./Signup.css";
import pic from "../images/bluepig.jpeg";
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

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
      // Step 1: Check if user already exists in "Users" table
      const { data: existingUser, error: checkError } = await supabase
        .from("Users")
        .select("id")
        .eq("email", email)
        .single(); // Retrieves a single user if found
  
      if (checkError && checkError.code !== "PGRST116") { 
        // "PGRST116" is Supabase's error code for "no rows found"
        throw checkError;
      }
  
      if (existingUser) {
        alert("User already exists! Please log in.");
        navigate("/sign-in");
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw error;

      const { error: insertError } = await supabase.from("Users").insert({
        id: data.user.id,
        name,
        email,
        password,
      });
      if (insertError) throw insertError;

      alert("Registration successful!");
      navigate("/sign-in");
    } catch (error) {
      alert(error.message);
    }
  };
  const [user, setUser] = useState(null);
  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
      if (error) throw error;
  
      // Listen for session changes (Only Once)
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          const user = session.user;
          const email = user.email;
          const name = user.user_metadata.full_name;
  
          // Check if user exists in DB
          const { data: existingUser, error: checkError } = await supabase
            .from("Users")
            .select("id")
            .eq("email", email)
            .single();
  
          if (!existingUser) {
            // Insert new user into DB
            await supabase.from("Users").insert({ id: user.id, name, email, password: null });
            alert("Registration successful!");
          } else {
            alert("User already exists! Redirecting to login.");
          }
  
          // Navigate after authentication
          navigate("/sign-in");
        }
      });
  
      // Cleanup Listener
      return () => {
        authListener?.unsubscribe();
      };
    } catch (error) {
      console.error("Error:", error.message);
      alert("Error: " + error.message);
    }
  };
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
        console.log("User is logged in:", session.user);
      } else {
        console.log("No active session.");
      }
    };

    checkSession();
  }, []);
  return (
    <div className="signup-container">
      <div className="signup-left">
        <img src={pic} alt="Signup" />
      </div>
      <div className="signup-right">
        <h2>Create Your Account</h2>
        <form onSubmit={handleSignup}>
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <button type="submit" className="signup-button">Sign Up</button>
        </form>
        <button onClick={handleGoogleSignIn} className="signup-google-button">
          <img src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" alt="Google Logo" />
          Sign up with Google
        </button>
        <p className="signup-login-text">If you already have an account, <a href="/sign-in">login here</a>.</p>
      </div>
    </div>
  );
};

export default SignUp;
