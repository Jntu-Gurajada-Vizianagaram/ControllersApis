const express = require('express');
const router = express.Router();
const pressNotes = require('../../apis/press_notes_api/PressNotesApi');
const { requireRoles } = require('../../middleware/auth');

const pressEditor = requireRoles('Admin', 'Developer', 'WebAdmin');
const deleteOnly = requireRoles('Admin');

router.get('/', pressNotes.public_press_notes);
router.get('/admin', pressNotes.admin_press_notes);
router.post('/admin/extract-text', pressEditor, pressNotes.upload, pressNotes.extract_press_note_text);
router.post('/admin', pressEditor, pressNotes.upload, pressNotes.create_press_note);
router.put('/admin/:id', pressEditor, pressNotes.upload, pressNotes.update_press_note);
router.delete('/admin/:id', deleteOnly, pressNotes.delete_press_note);

module.exports = router;
