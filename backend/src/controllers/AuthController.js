const supabase = require("../../supabaseClient.js");

exports.signUp = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const { user, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    await supabase.from("Users").insert([{ id: user.id, name, email, password }]);
    res.status(201).json({ message: "User signed up successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { user, session, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Login successful", session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.googleAuth = async (req, res) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) return res.status(400).json({ error: error.message });
    
    // Fetch user details after authentication
    setTimeout(async () => {
      const { data: userData, error: fetchError } = await supabase.auth.getUser();
      if (fetchError || !userData?.user) {
        return res.status(400).json({ error: "Failed to fetch user data" });
      }
      
      const { email, user_metadata } = userData.user;
      const name = user_metadata?.full_name;
      
      // Store user data in the Supabase database
      const { error: insertError } = await supabase.from("Users").upsert([{ name, email, password: null }]);
      if (insertError) return res.status(400).json({ error: insertError.message });
      
      res.json({ message: "Google Authentication successful" });
    }, 3000); // Small delay to ensure user data is available
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Google Sign-In Function (ADDED)
// Google Sign-In Function (UPDATED: No Auto Registration)
exports.googleSignIn = async (req, res) => {
  try {
    const { data: userData, error: fetchError } = await supabase.auth.getUser();

    if (fetchError || !userData?.user) {
      return res.status(500).json({ error: "Error fetching authenticated user data." });
    }

    const { email, user_metadata } = userData.user;
    const name = user_metadata?.full_name || "Unknown";

    // Check if the user exists in the database
    const { data: existingUser, error: checkError } = await supabase
      .from("Users")
      .select("id")
      .eq("email", email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      return res.status(500).json({ error: "Error checking user in database." });
    }

    if (existingUser) {
      return res.json({ message: "Login successful!", redirect: "/home" });
    } else {
      return res.json({ message: "User not found. Please sign up.", redirect: "/sign-up" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
