const express = require("express")
const router = express.Router()
const cors = require('cors')

// const esession = require('express-session')
// const bodyparser = require('body-parser')
// const cookieparser = require('cookie-parser')

const app = express()

app.use(express.json());

// app.use(cors({
//   origin :["http://localhost:7777"],
//   methods :["GET","POST"],
//   credentials : true,
// }))

// app.use(cookieparser())
// app.use(bodyparser.urlencoded({extended:true}));

// app.use(esession({
//   key : "userId",
//   secret : "subscribe",
//   resave : false,
//   saveUninitialized : false,
//   cookie:{
//     expires: 60*60*24,
//   },
// })
// );




const adminauth= require('../../apis/admin_api/admin_auth')
const hods= require('../../apis/admin_api/Add_hods')
const pwd = require('../../apis/admin_api/Generate_password')

router.get('/getadmins',adminauth.alladmins)
router.post('/login',adminauth.login)
router.get('/getrole',adminauth.role_session)
router.post('/add-hod',hods.addhods)
router.get('/remove-hod/:id',hods.remove_hod)
router.get('/generate-password',pwd.generate_password)

module.exports=router