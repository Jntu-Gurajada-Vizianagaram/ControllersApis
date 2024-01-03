const express = require('express')
const router = express.Router()
const aff_collegs = require('../../apis/affliatedColleges_api/AffliatedCollegesApi')

router.get('/all-colleges',aff_collegs.get_colleges)
router.post('/add-new-college',aff_collegs.insert_college)
router.delete('/remove-college',aff_collegs.delete_college)

module.exports = router