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
const { requireAuth, requireRoles } = require('../../middleware/auth')
const adminOnly = requireRoles('Admin')
const loginRateLimit = require('../../middleware/loginRateLimit')
const googleAuth = require('../../apis/admin_api/GoogleAuth')
const allowlist = require('../../apis/admin_api/Allowlist')


router.post('/login', loginRateLimit, adminauth.login)
router.get('/auth/google', googleAuth.start)
router.get('/auth/google/callback', googleAuth.callback)
router.post('/logout', requireAuth, adminauth.logout)
router.get('/getrole', requireAuth, adminauth.role_session)
router.get('/getadmins', adminOnly, hods.alladmins)
router.post('/add-hod', adminOnly, hods.addhods)
router.delete('/remove-hod/:id', adminOnly, hods.remove_hod)
router.get('/generate-password', adminOnly, pwd.generate_password)
router.get('/allstoredfiles', adminOnly, allfiles.Allstoredfiles)
router.get('/allexampdfs', adminOnly, exampdfs.exam_pdfs)
router.put('/update_hod/:id', adminOnly, adminauth.update_hod)
router.get('/allowlist', adminOnly, allowlist.list)
router.post('/allowlist', adminOnly, allowlist.add)
router.delete('/allowlist/:email', adminOnly, allowlist.remove)
module.exports=router
