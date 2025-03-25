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

  const defaultCategories = [
    "Shopping",
    "Groceries",
    "Transport",
    "Entertainment",
    "Food",
    "Education",
  ];

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return regex.test(password);
  };

  const insertDefaultCategories = async (userId) => {
    const categoryData = defaultCategories.map((label) => ({
      user_id: userId,
      label,
    }));
    await supabase.from("Categories").insert(categoryData);
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
      const { data: existingUser, error: checkError } = await supabase
        .from("Users")
        .select("id")
        .eq("email", email)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
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

      const userId = data.user.id;
      

      const { error: insertError } = await supabase.from("Users").insert({
        id: userId,
        name,
        email,
      });
      if (insertError) throw insertError;

      await insertDefaultCategories(userId);

      alert("Registration successful!");
      navigate("/sign-in");
    } catch (error) {
      alert(error.message);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/sign-up",
      },
    });

    if (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  const fetchAndStoreUser = async () => {
    const { data: userData, error } = await supabase.auth.getUser();

    if (error || !userData?.user) {
      console.error("Error fetching user data:", error);
      return;
    }

    const { id: userId, email, user_metadata } = userData.user;
    const name = user_metadata?.full_name || "New User";

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
      console.log("User already exists. No need to insert.");
      return;
    }

    const { error: insertError } = await supabase
      .from("Users")
      .insert([{ id: userId, name, email }]);

    if (!insertError) {
      await insertDefaultCategories(userId);
      alert("Registration successful!");
    } else {
      console.error("Error storing user data:", insertError);
    }
  };

  useEffect(() => {
    fetchAndStoreUser();
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
        <button onClick={signInWithGoogle} className="signup-google-button">
          <img src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" alt="Google Logo" />
          Sign up with Google
        </button>
        <p className="signup-login-text">If you already have an account, <a href="/sign-in">login here</a>.</p>
      </div>
    </div>
  );
};

export default SignUp;