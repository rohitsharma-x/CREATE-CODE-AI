const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/')
  .get(projectController.getProjects)
  .post(projectController.createProject);

router.route('/:id')
  .get(projectController.getProjectById)
  .patch(projectController.updateProject)
  .delete(projectController.deleteProject);

module.exports = router;

