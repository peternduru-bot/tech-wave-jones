const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
    submitContactForm, 
    getMessages, 
    getMessage,
    updateMessageStatus, 
    deleteMessage,
    markAsRead
} = require('../controllers/contactController');

// Validation rules
const contactValidation = [
    body('name').trim().notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('message').trim().notEmpty().withMessage('Message required')
        .isLength({ min: 10 }).withMessage('Message too short')
];

// ===== PUBLIC ROUTES (NO AUTHENTICATION REQUIRED) =====

// Submit contact form
router.post('/', contactValidation, submitContactForm);

// Get all messages
router.get('/messages', getMessages);

// Get single message by ID
router.get('/messages/:id', getMessage);

// Update message status
router.put('/messages/:id', updateMessageStatus);

// Delete message
router.delete('/messages/:id', deleteMessage);

// Mark message as read
router.patch('/messages/:id/read', markAsRead);

module.exports = router;