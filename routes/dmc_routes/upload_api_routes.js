const express = require('express')
const router = express.Router();
const webadmin= require('../../apis/dmc_api/DMCApi')

//------APIS for admin console-------//

router.get('/allimages',webadmin.all_imgs); //api for admin to get all images
router.post('/addimage',webadmin.dmcUpload,webadmin.insert_img) //api for admin to add image
router.get('/removeimage/:id',webadmin.delete_img); //api for admin to delete image
router.get('/carousel-images-preview',webadmin.carousel_imgs_preview); //api for admin to get carousel images preview
router.get('/carousel-images',webadmin.carousel_imgs); //api for frontend to get carousel images
router.get('/remove-from-carousel/:imgid',webadmin.remove_from_carousel); //api for admin to remove image from carousel
router.get('/add-to-carousel/:imgid',webadmin.add_to_carousel); //api for admin to add image to carousel
router.put('/update-carousel-image/:id',webadmin.dmcUpload,webadmin.update_carousel_image); //api for admin to update carousel image

//------API for BULK Images ----//
router.post('/add-event-photos',webadmin.bulkupload,webadmin.add_event_photos) //api for admin to add event photos
router.get('/get-event-photos',webadmin.get_events_photos) //api for frontend to get event photos
router.delete('/delete-event-photos/:id', webadmin.delete_event_photos); //api for admin to delete event photos
//router.patch('/update-event-photos/:id',webadmin.update_event_photos);
//------Event Photos---Request APIS---//
router.get('/webadmin-event-requests',webadmin.webadmin_event_requests); //api for only admin webadmin events added by webadminr
router.get('/webadmin-event-accept-request/:id',webadmin.webadmin_event_request_accept); //api for only admin to accept events added by webadminr
router.get('/webadmin-event-deny-request/:id',webadmin.webadmin_event_request_deny); //api for only admin to deny events added by webadminr


//---Request APIS---//
router.get('/webadmin-requests',webadmin.webadmin_requests); //api for only admin webadmin events added by webadminr
router.get('/webadmin-accept-request/:id',webadmin.webadmin_request_accept); //api for only admin to accept events added by webadminr
router.get('/webadmin-deny-request/:id',webadmin.webadmin_request_deny); //api for only admin to deny events added by webadminr


// ----- Apis for Frontend----------//
router.get('/main-carousel-images',webadmin.carousel_imgs); //api for frontend to get carousel images
router.get('/get-main-event-photos',webadmin.get_main_events_photos); //api for frontend to get main event photos

//---- API s for Gallery --------//
router.post('/webadmin/add-gallery-images'); //api for admin to add gallery images
router.get('webadmin/all-gallery-images');   //api for admin to get all gallery images


module.exports=router