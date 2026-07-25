const express =require('express')
const router = express.Router()
const mailing = require('../../apis/grievance_api/SendMail')
const grievance = require('../../apis/grievance_api/StudentGrievance')
const multer = require('multer')
const grievanceRateLimit = require('../../middleware/grievanceRateLimit')
const { requireRoles } = require('../../middleware/auth')
const { notificationFileFilter } = require('../../utils/uploads')
const grievanceReader = requireRoles('Admin', 'Developer')
const attachment = multer({
  storage: multer.memoryStorage(),
  limits: { files: 1, fileSize: 5 * 1024 * 1024 },
  fileFilter: notificationFileFilter,
}).single('file')

router.post('/sendmail', grievanceRateLimit, mailing.send)
router.get('/recieve', grievanceReader, mailing.receive)
router.post('/send-grievance', grievanceRateLimit, attachment, grievance.send_grievance)
router.get('/recieve-grievance', grievanceReader, grievance.receive)

module.exports=router
