const Project = require('../models/Project');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
exports.getProjects = async (req, res) => {
    try {
        const { category, featured, limit = 10, page = 1 } = req.query;
        
        // Build query
        let query = {};
        if (category) query.category = category;
        if (featured) query.featured = featured === 'true';
        
        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Execute query
        const projects = await Project.find(query)
            .sort({ featured: -1, createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);
        
        // Get total count
        const total = await Project.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: projects.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: projects
        });
        
    } catch (error) {
        console.error('❌ Get projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects'
        });
    }
};

// @desc    Get featured projects
// @route   GET /api/projects/featured
// @access  Public
exports.getFeaturedProjects = async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        
        const projects = await Project.find({ featured: true })
            .sort({ featuredOrder: 1, createdAt: -1 })
            .limit(parseInt(limit));
        
        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
        
    } catch (error) {
        console.error('❌ Get featured projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured projects'
        });
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
exports.getProject = async (req, res) => {
    try {
        let project;
        
        // Check if ID is MongoDB ObjectId or slug
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            project = await Project.findById(req.params.id);
        } else {
            project = await Project.findOne({ slug: req.params.id });
        }
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        // Increment view count
        project.views += 1;
        await project.save();
        
        res.status(200).json({
            success: true,
            data: project
        });
        
    } catch (error) {
        console.error('❌ Get project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project'
        });
    }
};

// @desc    Get projects by category
// @route   GET /api/projects/category/:category
// @access  Public
exports.getProjectsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { limit = 10 } = req.query;
        
        const projects = await Project.find({ category })
            .sort({ featured: -1, createdAt: -1 })
            .limit(parseInt(limit));
        
        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
        
    } catch (error) {
        console.error('❌ Get by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects by category'
        });
    }
};

// @desc    Search projects
// @route   GET /api/projects/search/:query
// @access  Public
exports.searchProjects = async (req, res) => {
    try {
        const { query } = req.params;
        
        const projects = await Project.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { technologies: { $in: [new RegExp(query, 'i')] } },
                { client: { $regex: query, $options: 'i' } }
            ]
        }).sort({ featured: -1, createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
        
    } catch (error) {
        console.error('❌ Search projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search projects'
        });
    }
};

// @desc    Create project (Admin only)
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
    try {
        const project = await Project.create(req.body);
        
        console.log('📁 New project created:'.green, project.title);
        
        res.status(201).json({
            success: true,
            data: project
        });
        
    } catch (error) {
        console.error('❌ Create project error:', error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Project with this title already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create project'
        });
    }
};

// @desc    Update project (Admin only)
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        console.log('📁 Project updated:'.yellow, project.title);
        
        res.status(200).json({
            success: true,
            data: project
        });
        
    } catch (error) {
        console.error('❌ Update project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update project'
        });
    }
};

// @desc    Delete project (Admin only)
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        console.log('📁 Project deleted:'.red, project.title);
        
        res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
        });
        
    } catch (error) {
        console.error('❌ Delete project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete project'
        });
    }
};

// @desc    Toggle project featured status (Admin only)
// @route   PATCH /api/projects/:id/featured
// @access  Private
exports.toggleFeatured = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        project.featured = !project.featured;
        await project.save();
        
        console.log(`📁 Project ${project.title} featured: ${project.featured}`.cyan);
        
        res.status(200).json({
            success: true,
            data: project
        });
        
    } catch (error) {
        console.error('❌ Toggle featured error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle featured status'
        });
    }
};

// @desc    Like a project
// @route   POST /api/projects/:id/like
// @access  Public
exports.likeProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        project.likes += 1;
        await project.save();
        
        res.status(200).json({
            success: true,
            likes: project.likes
        });
        
    } catch (error) {
        console.error('❌ Like project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to like project'
        });
    }
};