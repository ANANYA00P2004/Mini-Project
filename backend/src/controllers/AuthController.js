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
    const { provider } = req.body;
    try {
      const { user, session, error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) return res.status(400).json({ error: error.message });
      await supabase.from("Users").upsert([{ id: user.id, name: user.user_metadata.full_name, email: user.email, password: null }]);
      res.json({ message: "Google Authentication successful", session });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
