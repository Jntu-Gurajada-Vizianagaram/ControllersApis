const express = require('express')
const router = express.Router();
const webadmin= require('../../apis/dmc_api/DMCApi')




//------APIS for admin console-------//

router.get('/allimages',webadmin.all_imgs); 
router.post('/addimage',webadmin.dmcUpload,webadmin.insert_img)
router.get('/removeimage/:id',webadmin.delete_img);
router.get('/carousel-images-preview',webadmin.carousel_imgs_preview);
router.get('/carousel-images',webadmin.carousel_imgs_preview);
router.get('/remove-from-carousel/:imgid',webadmin.remove_from_carousel);
router.get('/add-to-carousel/:imgid',webadmin.add_to_carousel);
// router.patch('/update-event',router.update_event)

//------API for BULK Images ----//
router.post('/add-event-photos',webadmin.bulkupload,webadmin.add_event_photos)
router.get('/get-event-photos',webadmin.get_events_photos)
//------Event Photos---Request APIS---//
router.get('/webadmin-event-requests',webadmin.webadmin_event_requests); //api for only admin webadmin events added by webadminr
router.get('/webadmin-event-accept-request/:id',webadmin.webadmin_event_request_accept); //api for only admin to accept events added by webadminr
router.get('/webadmin-event-deny-request/:id',webadmin.webadmin_event_request_deny); //api for only admin to deny events added by webadminr


//---Request APIS---//
router.get('/webadmin-requests',webadmin.webadmin_requests); //api for only admin webadmin events added by webadminr
router.get('/webadmin-accept-request/:id',webadmin.webadmin_request_accept); //api for only admin to accept events added by webadminr
router.get('/webadmin-deny-request/:id',webadmin.webadmin_request_deny); //api for only admin to deny events added by webadminr


// ----- Apis for Frontend----------//
router.get('/main-carousel-images',webadmin.carousel_imgs);
router.get('/get-main-event-photos',webadmin.get_main_events_photos)



module.exports=router