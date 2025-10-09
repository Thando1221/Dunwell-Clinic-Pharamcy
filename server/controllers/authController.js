import jwt from "jsonwebtoken";
import { poolPromise } from "../db.js";

export const login = async (req, res) => {
  const { UserName, Password } = req.body;

  if (!UserName || !Password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("UserName", UserName)
      .query("SELECT * FROM Users WHERE UserName = @UserName");

    const user = result.recordset[0];
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // ⚠️ Plain text password check (not secure, but matches your DB)
    if (Password !== user.Password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.UserID, role: user.UserRole, name: user.Name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user.UserID,
        name: user.Name,
        surname: user.Surname,
        email: user.Email,
        role: user.UserRole
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
