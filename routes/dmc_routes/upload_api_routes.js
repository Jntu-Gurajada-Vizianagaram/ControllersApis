const express = require('express')
const router = express.Router();
const webadmin= require('../../apis/dmc_api/DMCApi')
const { requireRoles } = require('../../middleware/auth')
const webEditor = requireRoles('Admin', 'Developer', 'WebAdmin')
const deleteOnly = requireRoles('Admin')

//------APIS for admin console-------//

router.get('/allimages', webadmin.all_imgs);
router.post('/addimage', webEditor, webadmin.dmcUpload, webadmin.insert_img)
router.delete('/removeimage/:id', deleteOnly, webadmin.delete_img);
router.get('/carousel-images',webadmin.carousel_imgs); //api for frontend to get carousel images
router.patch('/remove-from-carousel/:imgid', webEditor, webadmin.remove_from_carousel);
router.patch('/add-to-carousel/:imgid', webEditor, webadmin.add_to_carousel);
router.put('/update-carousel-image/:id', webEditor, webadmin.dmcUpload, webadmin.update_carousel_image);

//------API for BULK Images ----//
router.post('/add-event-photos', webEditor, webadmin.bulkupload, webadmin.add_event_photos)
router.get('/get-event-photos',webadmin.get_events_photos) //api for frontend to get event photos
router.post('/event-photos/:id/images', webEditor, webadmin.eventAlbumImagesUpload, webadmin.add_event_album_images);
router.put('/update-event-photos/:id', webEditor, webadmin.update_event_photos);
router.delete('/delete-event-photos/:id', deleteOnly, webadmin.delete_event_photos);

module.exports=router
