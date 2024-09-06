const con = require('../config');
const bcrypt = require('bcrypt');
const saltRounds = 10; // The cost factor for bcrypt hashing

// Add a new admin (HOD)
exports.addhods = async (req, res) => {
    const { data } = req.body;
    console.log(data);

    // Hash the password before storing
    try {
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        const sql = "INSERT INTO admins(id, name, username, password, role) VALUES (?,?,?,?,?);";
        con.query(sql, [data.id, data.name, data.username, hashedPassword, data.role], (err) => {
            if (!err) {
                console.log("Data Inserted with Hashed Password");
                res.json({ Success: true });
            } else {
                console.log("Insertion Failed: " + err);
                res.status(401).json({ Success: false, MSG: `Data not Inserted ${err}` });
            }
        });
    } catch (error) {
        console.log("Hashing Error: " + error);
        res.status(500).json({ Success: false, MSG: 'Error hashing password' });
    }
};

// Fetch all admins
exports.alladmins = (req, res) => {
    const query = "SELECT * FROM admins;";
    try {
        con.query(query, (err, result) => {
            if (err) {
                res.json({ name: "ADMIN DATA", role: "NOT Fetched" });
                console.log(err + " not fetched");
            } else {
                res.json(result);
            }
        });
    } catch (error) {
        console.log(error);
    }
};

// Login function that checks and hashes plain-text passwords if needed
exports.login = (req, res) => {
    try {
        const { credentials } = req.body;
        const sql = "SELECT id, role, password, name FROM admins WHERE username = ?;";

        con.query(sql, [credentials.username], async (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json({ islogin: false, message: "Database Error" });
            } else if (result.length > 0) {
                let storedPassword = result[0].password;
                const adminId = result[0].id;

                // Check if the password is not hashed (plain text)
                if (!storedPassword.startsWith('$2b$')) { 
                    const hashedPassword = await bcrypt.hash(storedPassword, saltRounds);
                    const updateSql = "UPDATE admins SET password = ? WHERE id = ?";
                    con.query(updateSql, [hashedPassword, adminId], (err) => {
                        if (err) {
                            console.log("Failed to update password: " + err);
                        } else {
                            console.log(`Password hashed and updated for user: ${credentials.username}`);
                        }
                    });
                    storedPassword = hashedPassword;
                }

                // Compare the entered password with the stored hashed password
                const isMatch = await bcrypt.compare(credentials.password, storedPassword);

                if (isMatch) {
                    const role = result[0].role;
                    const admin_name = result[0].name;
                    req.session.userid = role;
                    res.send({ islogin: true, role: role, admin: admin_name });
                } else {
                    res.send({ islogin: false, message: "Incorrect Password" });
                }
            } else {
                res.send({ islogin: false, message: "Admin Doesn't Exist" });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ islogin: false, message: "Server Error" });
    }
};

// Remove an admin (HOD)
exports.remove_hod = (req, res) => {
    try {
        const hodid = req.params.id;
        const sql = `SELECT * FROM admins WHERE id=${hodid};`;

        con.query(sql, (err, result) => {
            if (result != null && result.length > 0) {
                const sqlDelete = `DELETE FROM admins WHERE id=${hodid};`;
                con.query(sqlDelete, (err) => {
                    if (!err) {
                        res.json({ msg: `${result[0].username} Admin removed` });
                    } else {
                        res.status(500).json({ msg: "Failed to remove admin" });
                    }
                });
            } else {
                console.log(err);
                res.status(400).json({ msg: "Admin not found" });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Server Error" });
    }
};

// Handle role session
exports.role_session = (req, res) => {
    try {
        const role = req.session.userid;
        if (role != "") {
            res.status(200).json({ MSG: role });
        } else {
            console.log("Role Not Assigned");
            res.json({ msg: "Role not assigned" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Server Error" });
    }
};
exports.hashExistingPasswords = async (req, res) => {
    try {
        const selectSql = "SELECT id, username, password FROM admins";
        
        // Fetch all existing admins
        con.query(selectSql, async (err, result) => {
            if (err) {
                console.log("Error fetching data: " + err);
                res.status(500).json({ Success: false, MSG: "Database error" });
            } else {
                // Loop through all admins and hash passwords if not already hashed
                for (const admin of result) {
                    const { id, username, password } = admin;
                    
                    // Check if the password is already hashed
                    if (!password.startsWith('$2b$')) {
                        const hashedPassword = await bcrypt.hash(password, saltRounds);

                        // Update the hashed password back in the database
                        const updateSql = "UPDATE admins SET password = ? WHERE id = ?";
                        con.query(updateSql, [hashedPassword, id], (err) => {
                            if (err) {
                                console.log(`Failed to update password for ${username}: ` + err);
                            } else {
                                console.log(`Password hashed for ${username}`);
                            }
                        });
                    } else {
                        console.log(`Password already hashed for ${username}`);
                    }
                }
                res.json({ Success: true, MSG: "All passwords hashed (if needed)" });
            }
        });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ Success: false, MSG: "Server error" });
    }
};