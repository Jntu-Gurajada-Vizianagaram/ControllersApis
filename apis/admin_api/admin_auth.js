const con = require("../config");
const express = require('express')
const cors = require("cors")

const session = require('express-session')
const bodyparser = require('body-parser')
const cookieparser = require('cookie-parser')

const app = express()

app.use(express.json());

app.use(cors({
  origin :["http://localhost:3000"],
  methods :["GET","POST"],
  credentials : true,
}))

app.use(cookieparser())
app.use(bodyparser.urlencoded({extended:true}));

app.use(session({
  key : "adminrole",
  secret : "admins",
  resave : false,
  saveUninitialized : false,
  cookie:{
    expires: 60*60*24,
  },
})
);


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
    const sql ="SELECT role , password FROM admins where username=(?);"
    con.query(sql,credentials.username,(err,result)=>{
      if(err){
        console.log(err)
      }
      else{
        if(result.length>0){
          if(credentials.password == result[0].password){
            console.log({result})
            // console.log(req.session.user)
            const role = result[0].role
            console.log(role)
            req.session.userid = role;
            res.send({login:true,message:role})
          }
          else{
            res.send({login:false,message:"Incorrect Password"})
          }
        }
        else{
          res.send({login:false,message:"Admin Dosn't Exist"})
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