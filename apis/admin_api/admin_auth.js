const con = require("../config");
const express = require('express')
const cors = require("cors")

const session = require('express-session')
const bodyparser = require('body-parser')
const cookieparser = require('cookie-parser')

const app = express()

app.use(express.json());
app.use(cors())

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
// })
// );
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
        // alladmins = result;
        res.json(result);
      }
    });
  } catch (error) {}
}


exports.login=(req,res) => {
  try {
    // console.log("loginapi")
    const { credentials } = req.body;
    const sql ="SELECT role , password , name FROM admins where username=(?);"
    con.query(sql,credentials.username,(err,result)=>{
      if(err){
        console.log(err)
      }
      else{
        if(result.length>0){
          if(credentials.password == result[0].password){
            const role = result[0].role
            const admin_name = result[0].name
            req.session.userid = role;
            res.send({islogin:true,role:role,admin:admin_name})
          }
          else{
            res.send({islogin:false,message:"Incorrect Password"})
          }
        }
        else{
          res.send({islogin:false,message:"Admin Dosn't Exist"})
        }
      }
    })

  } catch (error) {
    console.log(error);
  }
}

exports.role_session = (req,res)=>{
  try {
    console.log(req.session)
    const role = req.session.userid;
    if (role !=""){
      // console.log(role)
      res.status(200).json({MSG:role})
    }
    else{
      console.log("Role Not Assigned")
      res.json({msg:"role not assigned"})
    }
    // res.send({msg:"nothing"})

  } catch (error) {
    console.log(error)
  }
}