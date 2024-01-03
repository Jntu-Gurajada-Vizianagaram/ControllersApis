const express = require('express')
const router = express.Router();
const updates= require('../../apis/updates_api/UpdatesApi')




//------APIS for admin console-------//

router.get('/allevents',updates.all_events); 
router.post('/addevent',updates.Upload,updates.insert_event)
router.get('/removeevent/:id',updates.delete_event)
// router.patch('/update-event',router.update_event)

// ----- Apis for Frontend----------//

router.get('/allnotifications',updates.get_notifiactions); //ALL notifiactions  
router.get('/scrollingnotifications',updates.get_scrolling_notifiactions);


module.exports=router