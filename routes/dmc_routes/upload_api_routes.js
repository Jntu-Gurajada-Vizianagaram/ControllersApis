const express = require('express')
const router = express.Router();
const webadmin= require('../../apis/dmc_api/DMCApi')
const { requireRoles } = require('../../middleware/auth')
const webEditor = requireRoles('Admin', 'Developer', 'WebAdmin')
const adminOnly = requireRoles('Admin')
const deleteOnly = requireRoles('Admin')

//------APIS for admin console-------//

router.get('/allimages', webadmin.all_imgs);
router.post('/addimage', webEditor, webadmin.dmcUpload, webadmin.insert_img)
router.delete('/removeimage/:id', deleteOnly, webadmin.delete_img);
router.get('/carousel-images-preview', webadmin.carousel_imgs_preview);
router.get('/carousel-images',webadmin.carousel_imgs); //api for frontend to get carousel images
router.patch('/remove-from-carousel/:imgid', webEditor, webadmin.remove_from_carousel);
router.patch('/add-to-carousel/:imgid', webEditor, webadmin.add_to_carousel);
router.put('/update-carousel-image/:id', webEditor, webadmin.dmcUpload, webadmin.update_carousel_image);

//------API for BULK Images ----//
router.post('/add-event-photos', webEditor, webadmin.bulkupload, webadmin.add_event_photos)
router.get('/get-event-photos',webadmin.get_events_photos) //api for frontend to get event photos
router.delete('/delete-event-photos/:id', deleteOnly, webadmin.delete_event_photos);
//router.patch('/update-event-photos/:id',webadmin.update_event_photos);
//------Event Photos---Request APIS---//
router.get('/webadmin-event-requests', webadmin.webadmin_event_requests);
router.put('/webadmin-event-accept-request/:id', adminOnly, webadmin.webadmin_event_request_accept);
router.put('/webadmin-event-deny-request/:id', adminOnly, webadmin.webadmin_event_request_deny);


//---Request APIS---//
router.get('/webadmin-requests', webadmin.webadmin_requests);
router.put('/webadmin-accept-request/:id', adminOnly, webadmin.webadmin_request_accept);
router.put('/webadmin-deny-request/:id', adminOnly, webadmin.webadmin_request_deny);


// ----- Apis for Frontend----------//
router.get('/main-carousel-images',webadmin.carousel_imgs); //api for frontend to get carousel images
router.get('/get-main-event-photos',webadmin.get_main_events_photos); //api for frontend to get main event photos

module.exports=router
