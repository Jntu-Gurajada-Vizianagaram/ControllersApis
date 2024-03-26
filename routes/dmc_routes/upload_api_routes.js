const express = require('express')
const router = express.Router();
const updates= require('../../apis/dmc_api/DMCApi')




//------APIS for admin console-------//

router.get('/allimgs',updates.all_imgs); 
router.post('/addimg',updates.dmcUpload,updates.insert_img)
router.get('/removeimg/:id',updates.delete_img);
// router.patch('/update-event',router.update_event)

// ----- Apis for Frontend----------//




module.exports=router