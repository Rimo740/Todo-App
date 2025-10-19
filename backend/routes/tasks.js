// routes/tasks.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const taskController = require('../controllers/taskController');

// validation for creating a task
const createValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title max 200 chars')
];

// GET all
router.get('/', taskController.getTasks);

// GET one
router.get('/:id', taskController.getTask);

// POST create
router.post('/', createValidation, taskController.createTask);

// PUT update (partial update allowed)
router.put('/:id', taskController.updateTask);

// DELETE
router.delete('/:id', taskController.deleteTask);

module.exports = router;
