import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import "../Pages/Signup.css"

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);


const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") setName(value);
    else if (name === "email") setEmail(value);
    else if (name === "password") setPassword(value);
    else if (name === "confirmPassword") setConfirmPassword(value);
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (!validatePassword(password)) {
      alert("Password must have at least 1 uppercase, 1 lowercase, 1 number, 1 special character, and be at least 6 characters long.");
      return;
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw error;
      alert("Sign-up successful!");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google" });
      if (error) throw error;
      alert("Logged in with Google!");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="main-signup">
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form className="signup-form" onSubmit={handleSubmit}>
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
