const { validationResult } = require('express-validator');
const { Lesson, Quiz, Badge, UserProgress } = require('../models/Education');

// @desc    Get all lessons
exports.getLessons = async (req, res) => {
    try {
        const { category, difficulty } = req.query;
        let query = {};

        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;

        const lessons = await Lesson.find(query).sort('order');
        res.json(lessons);
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get lesson by ID
exports.getLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        res.json(lesson);
    } catch (error) {
        console.error('Error fetching lesson:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get quiz for lesson
exports.getLessonQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ lessonId: req.params.lessonId });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.json(quiz);
    } catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Submit quiz answers
exports.submitQuiz = async (req, res) => {
    try {
        const { answers } = req.body;
        const quiz = await Quiz.findById(req.params.quizId);
        
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        let score = 0;
        const results = answers.map((answer, index) => {
            const question = quiz.questions[index];
            const isCorrect = question.options.find(opt => opt._id.toString() === answer)?.isCorrect || false;
            if (isCorrect) score++;
            return {
                question: question.questionText,
                isCorrect,
                explanation: question.explanation
            };
        });

        const percentageScore = (score / quiz.questions.length) * 100;
        const passed = percentageScore >= quiz.passingScore;

        // Update user progress
        let userProgress = await UserProgress.findOne({ userId: req.user.id });
        if (!userProgress) {
            userProgress = new UserProgress({ userId: req.user.id });
        }

        const existingQuizResult = userProgress.quizResults.find(
            result => result.quizId.toString() === req.params.quizId
        );

        if (existingQuizResult) {
            existingQuizResult.score = Math.max(existingQuizResult.score, percentageScore);
            existingQuizResult.attempts += 1;
            existingQuizResult.lastAttemptDate = new Date();
        } else {
            userProgress.quizResults.push({
                quizId: req.params.quizId,
                score: percentageScore,
                attempts: 1,
                lastAttemptDate: new Date()
            });
        }

        // Check and award badges
        if (passed && !existingQuizResult?.score >= quiz.passingScore) {
            await checkAndAwardBadges(userProgress);
        }

        await userProgress.save();

        res.json({
            score: percentageScore,
            passed,
            results,
            attempts: existingQuizResult ? existingQuizResult.attempts + 1 : 1
        });

    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user progress
exports.getUserProgress = async (req, res) => {
    try {
        let userProgress = await UserProgress.findOne({ userId: req.user.id })
            .populate('completedLessons.lessonId')
            .populate('quizResults.quizId')
            .populate('earnedBadges.badgeId');

        if (!userProgress) {
            userProgress = new UserProgress({ userId: req.user.id });
            await userProgress.save();
        }

        res.json(userProgress);
    } catch (error) {
        console.error('Error fetching user progress:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Mark lesson as completed
exports.completeLesson = async (req, res) => {
    try {
        const lessonId = req.params.lessonId;
        const lesson = await Lesson.findById(lessonId);
        
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        let userProgress = await UserProgress.findOne({ userId: req.user.id });
        if (!userProgress) {
            userProgress = new UserProgress({ userId: req.user.id });
        }

        if (!userProgress.completedLessons.find(l => l.lessonId.toString() === lessonId)) {
            userProgress.completedLessons.push({
                lessonId,
                completedAt: new Date()
            });

            // Update streak
            const lastActivity = new Date(userProgress.lastActivity);
            const today = new Date();
            const diffDays = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                userProgress.currentStreak += 1;
            } else if (diffDays > 1) {
                userProgress.currentStreak = 1;
            }

            userProgress.lastActivity = today;

            await checkAndAwardBadges(userProgress);
            await userProgress.save();
        }

        res.json(userProgress);
    } catch (error) {
        console.error('Error completing lesson:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper function to check and award badges
async function checkAndAwardBadges(userProgress) {
    const badges = await Badge.find();
    const newBadges = [];

    for (const badge of badges) {
        const hasEarned = userProgress.earnedBadges.find(
            eb => eb.badgeId.toString() === badge._id.toString()
        );

        if (!hasEarned) {
            let shouldAward = false;

            switch (badge.criteria) {
                case 'COMPLETE_5_LESSONS':
                    shouldAward = userProgress.completedLessons.length >= 5;
                    break;
                case 'COMPLETE_10_QUIZZES':
                    shouldAward = userProgress.quizResults.length >= 10;
                    break;
                case '7_DAY_STREAK':
                    shouldAward = userProgress.currentStreak >= 7;
                    break;
                // Add more badge criteria as needed
            }

            if (shouldAward) {
                userProgress.earnedBadges.push({
                    badgeId: badge._id,
                    earnedAt: new Date()
                });
                newBadges.push(badge);
            }
        }
    }

    return newBadges;
}
