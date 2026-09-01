const express = require('express');
const router = express.Router();
const profiles = require('../../apis/admin_api/ProfileApi');
const { requireAuth } = require('../../middleware/auth');

router.get('/public', profiles.publicAll);
router.get('/public/:slug', profiles.publicOne);

router.use(requireAuth);

router.get('/me', profiles.me);
router.put('/me', profiles.updateMe);
router.get('/', profiles.all);
router.post('/', profiles.create);
router.put('/:id', profiles.update);
router.delete('/:id', profiles.remove);

module.exports = router;
