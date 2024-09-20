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
const allfiles = require('../../apis/admin_api/AllFiles')
const exampdfs = require('../../apis/for_wednesday_exam/ExamPDFs')


router.get('/getadmins',hods.alladmins)
router.post('/login',adminauth.login)
router.get('/getrole',adminauth.role_session)
router.post('/add-hod',hods.addhods)
router.delete('/remove-hod/:id',hods.remove_hod)
router.get('/generate-password/',pwd.generate_password)
router.get('/allstoredfiles',allfiles.Allstoredfiles)
router.get('/allexampdfs',exampdfs.exam_pdfs)
router.put('/update_hod/:id',adminauth.update_hod)
router.post('/api/addGoogleAllowlistEmail',adminauth.addGoogleAllowlist)
// router.put('auth/google',adminauth.googleLogin)
// router
module.exports=router
