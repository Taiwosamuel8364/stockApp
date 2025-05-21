const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ['basics', 'technical-analysis', 'fundamental-analysis', 'risk-management', 'advanced-trading'],
        required: true
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    estimatedDuration: {
        type: Number, // in minutes
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const QuizSchema = new mongoose.Schema({
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    questions: [{
        questionText: {
            type: String,
            required: true
        },
        options: [{
            text: String,
            isCorrect: Boolean
        }],
        explanation: String
    }],
    passingScore: {
        type: Number,
        default: 70
    }
});

const BadgeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    criteria: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['achievement', 'skill', 'milestone'],
        required: true
    }
});

const UserProgressSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    completedLessons: [{
        lessonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson'
        },
        completedAt: {
            type: Date,
            default: Date.now
        }
    }],
    quizResults: [{
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz'
        },
        score: Number,
        attempts: Number,
        lastAttemptDate: Date
    }],
    earnedBadges: [{
        badgeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Badge'
        },
        earnedAt: {
            type: Date,
            default: Date.now
        }
    }],
    currentStreak: {
        type: Number,
        default: 0
    },
    lastActivity: {
        type: Date,
        default: Date.now
    }
});

const Lesson = mongoose.model('Lesson', LessonSchema);
const Quiz = mongoose.model('Quiz', QuizSchema);
const Badge = mongoose.model('Badge', BadgeSchema);
const UserProgress = mongoose.model('UserProgress', UserProgressSchema);

module.exports = {
    Lesson,
    Quiz,
    Badge,
    UserProgress
};
