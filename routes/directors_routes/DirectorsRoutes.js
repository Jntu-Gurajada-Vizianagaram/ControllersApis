const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const directors = require('../../apis/admin_api/Directors');
const { requireRoles } = require('../../middleware/auth');
const { safeFilename, imageFileFilter } = require('../../utils/uploads');

const router = express.Router();
const adminOnly = requireRoles('Admin');
const destination = path.resolve('./storage/directors');
fs.mkdirSync(destination, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, destination),
    filename: (req, file, cb) => cb(null, safeFilename(file)),
  }),
  limits: { files: 1, fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFileFilter,
}).single('photo');

router.get('/all-directors', directors.all);
router.post('/add-director', adminOnly, upload, directors.add);
router.put('/update-director/:id', adminOnly, upload, directors.update);
router.delete('/delete-director/:id', adminOnly, directors.remove);

module.exports = router;
