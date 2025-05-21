const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { getLessons, getLesson, getLessonQuiz, submitQuiz, getUserProgress, completeLesson } = require('../controllers/educationController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// @route   GET /api/education/lessons
// @desc    Get all lessons
router.get('/lessons', getLessons);

// @route   GET /api/education/lessons/:id
// @desc    Get lesson by ID
router.get('/lessons/:id', getLesson);

// @route   GET /api/education/lessons/:lessonId/quiz
// @desc    Get quiz for lesson
router.get('/lessons/:lessonId/quiz', getLessonQuiz);

// @route   POST /api/education/quizzes/:quizId/submit
// @desc    Submit quiz answers
router.post('/quizzes/:quizId/submit', [
    check('answers').isArray().withMessage('Answers must be an array'),
], submitQuiz);

// @route   GET /api/education/progress
// @desc    Get user's progress
router.get('/progress', getUserProgress);

// @route   POST /api/education/lessons/:lessonId/complete
// @desc    Mark lesson as completed
router.post('/lessons/:lessonId/complete', completeLesson);

module.exports = router;
