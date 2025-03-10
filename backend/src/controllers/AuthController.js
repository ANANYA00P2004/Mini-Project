const supabase = require("../supabaseClient.js");

// Default categories to add for each new user
const DEFAULT_CATEGORIES = [
  "Shopping",
  "Groceries",
  "Transport",
  "Entertainment",
  "Food",
  "Rent",
  "Education"
];

// Helper function to add default categories
async function addDefaultCategories(userId) {
  try {
    // Create an array of category objects
    const categoryObjects = DEFAULT_CATEGORIES.map(label => ({
      label,
      user_id: userId
    }));
    
    // Insert all categories at once
    const { error } = await supabase
      .from("Categories")
      .insert(categoryObjects);
      
    if (error) {
      console.error("Error adding default categories:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Exception while adding default categories:", err);
    return false;
  }
}

exports.signUp = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const { user, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    
    // Insert user into Users table
    const { error: insertError } = await supabase
      .from("Users")
      .insert([{ id: user.id, name, email,password }]); // Removed storing password
      
    if (insertError) {
      return res.status(400).json({ error: insertError.message });
    }
    
    // Add default categories for the new user
    const categoriesAdded = await addDefaultCategories(user.id);
    
    if (!categoriesAdded) {
      // Categories weren't added but user was created
      // You might want to log this or handle it differently
      return res.status(201).json({ 
        message: "User signed up successfully, but default categories could not be added." 
      });
    }
    
    res.status(201).json({ message: "User signed up successfully with default categories" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// You should also update the Google authentication to add default categories
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
      const userId = userData.user.id;
      
      // Check if user already exists in Users table
      const { data: existingUser, error: checkError } = await supabase
        .from("Users")
        .select("id")
        .eq("id", userId)
        .single();
        
      const userExists = !(checkError || !existingUser);
      
      // Store user data in the Supabase database (without storing password)
      const { error: insertError } = await supabase
        .from("Users")
        .upsert([{ id: userId, name, email }]);
        
      if (insertError) return res.status(400).json({ error: insertError.message });
      
      // If this is a new user, add default categories
      if (!userExists) {
        await addDefaultCategories(userId);
      }
      
      res.json({ message: "Google Authentication successful" });
    }, 3000); // Small delay to ensure user data is available
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Include other existing exports here
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