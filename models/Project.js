const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true,
        unique: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    slug: {
        type: String,
        lowercase: true,
        unique: true
    },
    category: {
        type: String,
        required: [true, 'Project category is required'],
        enum: {
            values: ['web-design', 'mobile-app', 'frontend', 'ecommerce', 'seo', 'cloud', 'ui-ux', 'branding'],
            message: '{VALUE} is not a valid category'
        }
    },
    description: {
        type: String,
        required: [true, 'Project description is required'],
        minlength: [20, 'Description must be at least 20 characters'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    fullDescription: {
        type: String,
        maxlength: [5000, 'Full description cannot exceed 5000 characters']
    },
    client: {
        type: String,
        required: [true, 'Client name is required'],
        trim: true
    },
    clientWebsite: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        default: 'default-project.jpg'
    },
    gallery: [{
        type: String
    }],
    technologies: [{
        type: String,
        required: [true, 'At least one technology is required']
    }],
    features: [{
        type: String
    }],
    liveUrl: {
        type: String,
        trim: true
    },
    githubUrl: {
        type: String,
        trim: true
    },
    behanceUrl: {
        type: String,
        trim: true
    },
    dribbbleUrl: {
        type: String,
        trim: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    featuredOrder: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['planned', 'in-progress', 'completed', 'on-hold'],
        default: 'completed'
    },
    startDate: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    duration: {
        type: String,
        description: 'e.g., "3 months", "2 weeks"'
    },
    team: [{
        name: String,
        role: String,
        avatar: String
    }],
    testimonial: {
        quote: String,
        author: String,
        position: String,
        rating: {
            type: Number,
            min: 1,
            max: 5
        }
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    seo: {
        title: String,
        description: String,
        keywords: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ===== MIDDLEWARE =====

// Create slug from title before saving
projectSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
    this.updatedAt = Date.now();
    next();
});

// ===== VIRTUAL PROPERTIES =====

// Get project URL
projectSchema.virtual('url').get(function() {
    return `/projects/${this.slug || this._id}`;
});

// Get thumbnail image
projectSchema.virtual('thumbnail').get(function() {
    return this.gallery && this.gallery.length > 0 ? this.gallery[0] : this.image;
});

// Calculate completion percentage
projectSchema.virtual('completionPercentage').get(function() {
    if (this.status === 'completed') return 100;
    if (this.status === 'planned') return 0;
    if (this.status === 'in-progress') return 50;
    if (this.status === 'on-hold') return 25;
    return 0;
});

// ===== STATIC METHODS =====

// Get featured projects
projectSchema.statics.getFeatured = function(limit = 6) {
    return this.find({ featured: true })
        .sort({ featuredOrder: 1, createdAt: -1 })
        .limit(limit);
};

// Get projects by category
projectSchema.statics.getByCategory = function(category, limit = 10) {
    return this.find({ category })
        .sort({ featured: -1, createdAt: -1 })
        .limit(limit);
};

// Search projects
projectSchema.statics.search = function(query) {
    return this.find({
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { technologies: { $in: [new RegExp(query, 'i')] } },
            { client: { $regex: query, $options: 'i' } }
        ]
    }).sort({ featured: -1, createdAt: -1 });
};

// ===== INSTANCE METHODS =====

// Increment view count
projectSchema.methods.incrementViews = async function() {
    this.views += 1;
    return this.save();
};

// Toggle like
projectSchema.methods.toggleLike = async function() {
    this.likes += 1;
    return this.save();
};

// Check if project is recent (within last 30 days)
projectSchema.methods.isRecent = function() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return this.createdAt > thirtyDaysAgo;
};

// ===== INDEXES =====
projectSchema.index({ title: 'text', description: 'text', technologies: 'text' });
projectSchema.index({ category: 1, featured: -1, createdAt: -1 });
projectSchema.index({ slug: 1 }, { unique: true });
projectSchema.index({ status: 1, completedAt: -1 });

// ===== EXPORT MODEL =====
module.exports = mongoose.model('Project', projectSchema);