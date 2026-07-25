const express = require('express');
const router = express.Router();
const siteContent = require('../../apis/site_api/SiteContentApi');
const { requireRoles } = require('../../middleware/auth');

const siteEditor = requireRoles('Admin', 'Developer', 'Updates');
const deleteOnly = requireRoles('Admin');

router.get('/navbar', siteContent.public_navbar);
router.get('/admin/navbar', siteContent.admin_navbar);
router.post('/admin/navbar', siteEditor, siteContent.create_nav_item);
router.put('/admin/navbar/:id', siteEditor, siteContent.update_nav_item);
router.delete('/admin/navbar/:id', deleteOnly, siteContent.delete_nav_item);

router.get('/youtube-videos', siteContent.public_youtube_videos);
router.get('/admin/youtube-videos', siteContent.admin_youtube_videos);
router.post('/admin/youtube-videos', siteEditor, siteContent.create_youtube_video);
router.put('/admin/youtube-videos/:id', siteEditor, siteContent.update_youtube_video);
router.delete('/admin/youtube-videos/:id', deleteOnly, siteContent.delete_youtube_video);

module.exports = router;
