const con = require("../config");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const express = require('express');
const cors = require("cors");

const session = require('express-session');
const bodyparser = require('body-parser');
const cookieparser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cors());

// app.use(cors({
//   origin :["http://localhost:3000"],
//   methods :["GET","POST"],
//   credentials : true,
// }))

// app.use(cookieparser())
// app.use(bodyparser.urlencoded({extended:true}));

// app.use(session({
//   key : "adminrole",
//   secret : "admins",
//   resave : false,
//   saveUninitialized : false,
//   cookie:{
//     expires: 60*60*24,
//   },
// }));

exports.login = (req, res) => {
  try {
      const { credentials } = req.body;
      const sql = "SELECT role, password, name FROM admins WHERE username=(?);";

      con.query(sql, [credentials.username], async (err, result) => {
          if (err) {
              console.log(err);
              res.status(500).json({ islogin: false, message: "Database Error" });
          } else if (result.length > 0) {
              let storedPassword = result[0].password;

              // If the password is plain text (not hashed), hash it and update the database
              if (!storedPassword.startsWith('$2b$')) { // bcrypt hashed passwords start with $2b$
                  const hashedPassword = await bcrypt.hash(storedPassword, saltRounds);
                  const updateSql = "UPDATE admins SET password = ? WHERE username = ?";
                  con.query(updateSql, [hashedPassword, credentials.username], (err) => {
                      if (err) {
                          console.log("Failed to update password: " + err);
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

exports.alladmins = (req, res) => {
  const query = "SELECT * FROM admins;";
  try {
    con.query(query, (err, result) => {
      if (err) {
        res.json({name:"ADMIN DATA",role:"NOT Fetched"})
        console.log(err + "not fetched");
      } else {
        res.json(result);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

exports.role_session = (req, res) => {
  try {
    const role = req.session.userid;
    if (role !== "") {
      res.status(200).json({ MSG: role });
    } else {
      console.log("Role Not Assigned");
      res.json({ msg: "role not assigned" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Update HOD (Admin) details
exports.update_hod = async (req, res) => {
  const adminId = req.params.id;
  const { name, username, password, role } = req.body;

  try {
    // If a new password is provided, hash it before updating
    let hashedPassword = password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    const sql = "UPDATE admins SET name = ?, username = ?, password = ?, role = ? WHERE id = ?;";
    con.query(sql, [name, username, hashedPassword, role, adminId], (err, result) => {
      if (err) {
        console.log("Error updating admin: " + err);
        res.status(500).json({ Success: false, MSG: "Failed to update admin" });
      } else {
        res.json({ Success: true, MSG: "Admin updated successfully" });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ Success: false, MSG: "Error updating admin" });
  }
};
