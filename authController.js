// authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sql, poolConnect } from "./db.js";
import dotenv from "dotenv";
dotenv.config();

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    await poolConnect;
    const request = new sql.Request();

    request.input("UserName", sql.NVarChar, username);

    const result = await request.query(
      "SELECT * FROM Users WHERE UserName = @UserName"
    );

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = result.recordset[0];

    // Compare password (assuming DB stores hashed passwords with bcrypt)
    const isMatch = await bcrypt.compare(password, user.Password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.UserID, role: user.UserRole },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user.UserID,
        name: user.Name,
        surname: user.Surname,
        role: user.UserRole,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
