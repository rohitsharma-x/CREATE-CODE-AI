const Project = require('../models/Project');
const Review = require('../models/Review');
const Chat = require('../models/Chat');
const Issue = require('../models/Issue');

/**
 * Get all user projects with search and filters
 * GET /api/projects
 */
const getProjects = async (req, res, next) => {
  try {
    const { status, search, sort = '-createdAt' } = req.query;

    const query = { user: req.user._id };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { techStack: { $regex: search, $options: 'i' } },
        { languages: { $regex: search, $options: 'i' } },
      ];
    }

    const projects = await Project.find(query).sort(sort);

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get project by ID with related stats and sub-entities
 * GET /api/projects/:id
 */
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Load related code reviews, chats, and open issues
    const [reviews, chats, issues] = await Promise.all([
      Review.find({ project: project._id, user: req.user._id }).sort('-createdAt').limit(10),
      Chat.find({ project: project._id, user: req.user._id }).sort('-updatedAt').limit(10),
      Issue.find({ project: project._id, user: req.user._id }).sort('-createdAt').limit(10),
    ]);

    res.status(200).json({
      success: true,
      project,
      related: {
        reviews,
        chats,
        issues,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create new project
 * POST /api/projects
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description, languages, techStack, status, progress, githubRepo } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required.',
      });
    }

    const project = await Project.create({
      user: req.user._id,
      name,
      description: description || '',
      languages: Array.isArray(languages) ? languages : [languages || 'JavaScript'],
      techStack: Array.isArray(techStack) ? techStack : [techStack || 'MERN'],
      status: status || 'Active',
      progress: progress || 0,
      githubRepo: githubRepo || null,
      activity: [
        {
          action: 'Project Created',
          details: `Created project "${name}"`,
          timestamp: new Date(),
        },
      ],
    });

    res.status(201).json({
      success: true,
      project,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update project
 * PATCH /api/projects/:id
 */
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    const allowedUpdates = ['name', 'description', 'languages', 'techStack', 'status', 'progress', 'githubRepo'];
    allowedUpdates.forEach((key) => {
      if (req.body[key] !== undefined) {
        project[key] = req.body[key];
      }
    });

    project.activity.push({
      action: 'Project Updated',
      details: 'Updated project configuration',
      timestamp: new Date(),
    });

    await project.save();

    res.status(200).json({
      success: true,
      project,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete project
 * DELETE /api/projects/:id
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Clean up or dissociate reviews and chats
    await Promise.all([
      Review.updateMany({ project: project._id }, { $unset: { project: '' } }),
      Chat.updateMany({ project: project._id }, { $unset: { project: '' } }),
      Issue.updateMany({ project: project._id }, { $unset: { project: '' } }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};

