const express = require('express');
const router = express.Router();
const {
    getProjects,
    getFeaturedProjects,
    getProject,
    getProjectsByCategory,
    searchProjects,
    createProject,
    updateProject,
    deleteProject,
    toggleFeatured,
    likeProject
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getProjects);
router.get('/featured', getFeaturedProjects);
router.get('/category/:category', getProjectsByCategory);
router.get('/search/:query', searchProjects);
router.get('/:id', getProject);
router.post('/:id/like', likeProject);

// Admin routes (protected)
router.post('/', protect, authorize('admin'), createProject);
router.put('/:id', protect, authorize('admin'), updateProject);
router.delete('/:id', protect, authorize('admin'), deleteProject);
router.patch('/:id/featured', protect, authorize('admin'), toggleFeatured);

module.exports = router;