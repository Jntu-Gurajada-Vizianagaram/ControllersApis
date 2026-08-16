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
const adminAccounts= require('../../apis/admin_api/AdminUsers')
const pwd = require('../../apis/admin_api/Generate_password')
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
router.get('/getadmins', adminOnly, adminAccounts.all)
router.get('/users', adminOnly, adminAccounts.all)
router.post('/users', adminOnly, adminAccounts.add)
router.put('/users/:id', adminOnly, adminauth.update_admin_user)
router.delete('/users/:id', adminOnly, adminAccounts.remove)
router.get('/generate-password', adminOnly, pwd.generate_password)
router.get('/allowlist', adminOnly, allowlist.list)
router.post('/allowlist', adminOnly, allowlist.add)
router.delete('/allowlist/:email', adminOnly, allowlist.remove)
router.post('/password-reset/request', adminauth.request_password_reset)
router.post('/password-reset/confirm', adminauth.confirm_password_reset)
module.exports=router
