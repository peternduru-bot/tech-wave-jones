const Message = require('../models/Message');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContactForm = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, email, message } = req.body;

        // Save to database
        const newMessage = await Message.create({
            name,
            email,
            message
        });

        console.log(`📝 New message from: ${name} (${email})`.cyan);

        // Try to send email notification (don't fail if email doesn't work)
        try {
            // Check if email credentials are configured
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                const mailOptions = {
                    from: `"TECH-WAVE JONES" <${process.env.EMAIL_USER}>`,
                    to: process.env.EMAIL_USER,
                    replyTo: email,
                    subject: `📬 New Contact Form: ${name}`,
                    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
                };

                await transporter.sendMail(mailOptions);
                console.log('📧 Email notification sent'.green);
            }
        } catch (emailError) {
            console.log('📧 Email not configured or failed - continuing anyway'.yellow);
        }

        res.status(201).json({
            success: true,
            data: {
                id: newMessage._id,
                name: newMessage.name,
                email: newMessage.email,
                createdAt: newMessage.createdAt
            },
            message: '✨ Thank you! Your message has been sent successfully.'
        });

    } catch (error) {
        console.error('❌ Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong. Please try again.'
        });
    }
};

// @desc    Get all messages
// @route   GET /api/contact/messages
// @access  Public (was Private)
exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort('-createdAt');
        
        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (error) {
        console.error('❌ Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages'
        });
    }
};

// @desc    Get single message
// @route   GET /api/contact/messages/:id
// @access  Public (was Private)
exports.getMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: message
        });
    } catch (error) {
        console.error('❌ Get message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch message'
        });
    }
};

// @desc    Update message status
// @route   PUT /api/contact/messages/:id
// @access  Public (was Private)
exports.updateMessageStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        console.log(`📝 Message ${message._id} marked as ${status}`.yellow);

        res.status(200).json({
            success: true,
            data: message
        });
    } catch (error) {
        console.error('❌ Update message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update message'
        });
    }
};

// @desc    Delete message
// @route   DELETE /api/contact/messages/:id
// @access  Public (was Private)
exports.deleteMessage = async (req, res) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.id);
        
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        console.log(`📝 Message ${message._id} deleted`.red);

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('❌ Delete message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete message'
        });
    }
};

// @desc    Mark message as read
// @route   PATCH /api/contact/messages/:id/read
// @access  Public (was Private)
exports.markAsRead = async (req, res) => {
    try {
        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { status: 'read' },
            { new: true }
        );
        
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.status(200).json({
            success: true,
            data: message
        });
    } catch (error) {
        console.error('❌ Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark message as read'
        });
    }
};