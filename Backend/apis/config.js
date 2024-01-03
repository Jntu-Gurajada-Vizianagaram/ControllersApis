const mysql = require("mysql2");


const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1437890",
  database: "jntugv",
  port: "3306"  ,
});
// const con = mysql.createConnection({
//   host: "3.7.40.139",
//   user: "JNTUGV",
//   password: "password",
//   database: "jntugv",
//   port: "3306",
// });
// const con=mysql.createConnection({
//     host:"localhost",
//     user:"root",
//     password:"1437890",
//     database:"jntugv",
//     port:"3306"
// })


module.exports = con;
