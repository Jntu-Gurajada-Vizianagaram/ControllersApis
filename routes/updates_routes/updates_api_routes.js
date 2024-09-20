const express = require('express')
const router = express.Router();
const updates= require('../../apis/updates_api/UpdatesApi')

//------APIS for admin console-------//
//-------APIS for admin console-------//

router.get('/every-events',updates.every_events); //api for only admin update events added by any one
router.get('/all-admin-events',updates.all_admin_events); //api for only admin update events added by admin
router.get('/all-updater-events/:adminid',updates.all_updater_events); //api for only admin update events added by updater
router.post('/add-event',updates.Upload,updates.insert_event)
router.delete('/remove-event/:id',updates.delete_event)
router.put('/update-event/:id',updates.Upload,updates.update_event)

//---Request APIS---//
router.get('/update-requests',updates.update_requests); //api for only admin update events added by updater
router.get('/update-accept-request/:id',updates.update_request_accept); //api for only admin to accept events added by updater
router.get('/update-deny-request/:id',updates.update_request_deny); //api for only admin to deny events added by updater

// ----- Apis for Frontend----------//

router.get('/allnotifications',updates.get_notifiactions); //ALL notifiactions  
router.get('/scrollingnotifications',updates.get_scrolling_notifiactions);


module.exports=router