const express =require('express')
const router = express.Router()
const mailing = require('../../apis/grievance_api/SendMail')
const grievance = require('../../apis/grievance_api/StudentGrievance')

router.post('/sendmail',mailing.send)
router.get('/recieve',mailing.receive)
router.post('/send-grievance',grievance.send_grievance)
router.get('/recieve-grievance',grievance.receive)

module.exports=router