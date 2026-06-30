const express = require('express')
const router = express.Router();
const updates= require('../../apis/updates_api/UpdatesApi')
const { requireRoles } = require('../../middleware/auth')
const updatesEditor = requireRoles('Admin', 'Developer', 'Updates')
const adminOnly = requireRoles('Admin')
const deleteOnly = requireRoles('Admin')

//------APIS for admin console-------//

router.get('/every-events', updatesEditor, updates.every_events);
router.get('/all-admin-events', updatesEditor, updates.all_admin_events);
router.get('/all-updater-events/:adminid', updatesEditor, updates.all_updater_events);
router.post('/add-event', updatesEditor, updates.Upload, updates.insert_event)
router.delete('/remove-event/:id', deleteOnly, updates.delete_event)
router.put('/update-event/:id', updatesEditor, updates.Upload, updates.update_event)

//---Request APIS---//
router.get('/update-requests', adminOnly, updates.update_requests);
router.put('/update-accept-request/:id', adminOnly, updates.update_request_accept);
router.put('/update-deny-request/:id', adminOnly, updates.update_request_deny);

// ----- Apis for Frontend----------//

router.get('/allnotifications',updates.get_notifiactions); //ALL notifiactions
router.get('/scrollingnotifications',updates.get_scrolling_notifiactions);


module.exports=router
