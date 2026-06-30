const express = require('express')
const router = express.Router()
const aff_collegs = require('../../apis/affliatedColleges_api/AffliatedCollegesApi')
const { requireRoles } = require('../../middleware/auth')
const collegeEditor = requireRoles('Admin', 'Developer', 'AffiliatedColleges', 'AffliatedColleges')
const deleteOnly = requireRoles('Admin')

router.get('/all-colleges',aff_collegs.get_colleges)
router.post('/add-new-college', collegeEditor, aff_collegs.insert_college)
router.put('/update-college/:id', collegeEditor, aff_collegs.update_college)
router.delete('/remove-college/:id', deleteOnly, aff_collegs.delete_college)

module.exports = router
