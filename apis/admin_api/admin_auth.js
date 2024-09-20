const con = require("../config"); // Assuming config.js handles your database connection
const bcrypt = require('bcrypt');
const saltRounds = 10;
const express = require('express');
const cors = require("cors");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const session = require('express-session');
const bodyparser = require('body-parser');
const cookieparser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cookieparser());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Admin Login Function
exports.login = (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM admins WHERE username = ?";

    con.query(sql, [username], (err, result) => {
        if (err) {
            console.error("Error during login: ", err);
            return res.status(500).json({ Success: false, MSG: "Server error during login." });
        }

        if (result.length === 0) {
            return res.status(401).json({ Success: false, MSG: "Invalid username or password." });
        }

        const admin = result[0];

        bcrypt.compare(password, admin.password, (err, isMatch) => {
            if (err) {
                console.error("Error during password comparison: ", err);
                return res.status(500).json({ Success: false, MSG: "Server error during login." });
            }

            if (isMatch) {
                req.session.userid = admin.role;
                req.session.username = admin.username;
                return res.json({ Success: true, MSG: "Login successful", role: admin.role });
            } else {
                return res.status(401).json({ Success: false, MSG: "Invalid username or password." });
            }
        });
    });
};

// Google OAuth Login
exports.googleLogin = async (req, res) => {
    try {
        const { tokenId } = req.body;

        if (!tokenId) {
            return res.status(400).json({ Success: false, MSG: "Token ID is required." });
        }

        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { email } = ticket.getPayload();

        const sql = "SELECT * FROM oauth_allowlist WHERE email = ?";
        con.query(sql, [email], (err, result) => {
            if (err) {
                console.error("Error verifying Google OAuth: ", err);
                return res.status(500).json({ Success: false, MSG: "Server error during Google OAuth." });
            }

            if (result.length === 0) {
                return res.status(403).json({ Success: false, MSG: "Email not authorized for login." });
            }

            req.session.userid = result[0].role || "admin"; // Use the role from the database if available
            req.session.username = email;
            res.json({ Success: true, MSG: "Google OAuth login successful", role: req.session.userid });
        });
    } catch (error) {
        console.error("Error in Google OAuth login: ", error);
        res.status(500).json({ Success: false, MSG: "Server error during Google OAuth login." });
    }
};

// Fetch All Admins
exports.alladmins = (req, res) => {
    const sql = "SELECT * FROM admins";

    con.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching admins: ", err);
            return res.status(500).json({ Success: false, MSG: "Server error fetching admins." });
        }

        res.json(result);
    });
};

// Check Role from Session
exports.role_session = (req, res) => {
    const role = req.session.userid;
    if (role) {
        res.json({ Success: true, role });
    } else {
        res.status(401).json({ Success: false, MSG: "Not logged in." });
    }
};

// Update HOD (Admin) Details
exports.update_hod = async (req, res) => {
    const { id, name, username, password, role } = req.body;
    let sql, params;

    if (password) {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        sql = "UPDATE admins SET name = ?, username = ?, password = ?, role = ? WHERE id = ?";
        params = [name, username, hashedPassword, role, id];
    } else {
        sql = "UPDATE admins SET name = ?, username = ?, role = ? WHERE id = ?";
        params = [name, username, role, id];
    }

    con.query(sql, params, (err, result) => {
        if (err) {
            console.error("Error updating admin: ", err);
            return res.status(500).json({ Success: false, MSG: "Server error updating admin." });
        }

        res.json({ Success: true, MSG: "Admin updated successfully." });
    });
};

// Remove HOD (Admin)
exports.remove_hod = async (req, res) => {
    const adminId = req.params.id;
    const sql = "DELETE FROM admins WHERE id = ?;";

    con.query(sql, [adminId], (err, result) => {
        if (err) {
            console.error("Error removing admin: ", err);
            return res.status(500).json({ Success: false, MSG: "Server error removing admin." });
        }

        res.json({ Success: true, MSG: "Admin removed successfully." });
    });
};

// Add Email to Google OAuth Allowlist (Only by Super-Admin)
exports.addGoogleAllowlist = (req, res) => {
    const { email } = req.body;
    const role = req.session.userid;

    if (role !== 'Admin') {
        return res.status(403).json({ Success: false, MSG: "Unauthorized access" });
    }

    const sql = "INSERT INTO oauth_allowlist (email) VALUES (?);";

    con.query(sql, [email], (err, result) => {
        if (err) {
            console.error("Error adding email to allowlist: ", err);
            return res.status(500).json({ Success: false, MSG: "Server error adding email to allowlist." });
        }

        res.json({ Success: true, MSG: "Email added to allowlist successfully." });
    });
};
