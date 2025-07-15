const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// CORS Configuration
app.use(cors({
    origin: ['http://localhost:8080', 'http://192.168.227.204:8080', 'http://127.0.0.1:8080', 'http://192.168.1.6:8080', 'http://172.27.80.1:8080'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const mongoURI = 'mongodb://127.0.0.1:27017/todo_manager';
console.log('Attempting to connect to MongoDB at:', mongoURI);

mongoose.connect(mongoURI)
    .then(() => {
        console.log('Successfully connected to MongoDB.');
        console.log('Database: todo_manager');
        console.log('Port: 27017');
        
        // Only start the server after successfully connecting to MongoDB
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        console.log('\nPlease make sure:');
        console.log('1. MongoDB is installed');
        console.log('2. MongoDB service is running');
        console.log('3. MongoDB is accessible at mongodb://127.0.0.1:27017\n');
        process.exit(1);
    });

// User Schema
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    gender: String,
    dob: Date,
    phoneNumber: String,
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String
});

const User = mongoose.model('User', userSchema);

// Task Schema
const taskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    priority: { type: String, required: true },
    deadline: { type: Date, required: true },
    reminder: { type: Date },
    done: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    pageType: { type: String, enum: ['home', 'month', 'date'], required: true },
    category: { type: String, default: 'General' },
    tags: [{ type: String }]
});

const Task = mongoose.model('Task', taskSchema);

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// Signup Route
app.post('/api/signup', async (req, res) => {
    console.log('Signup request received:', req.body);
    
    try {
        const { firstName, lastName, gender, dob, phoneNumber, username, email, password } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and password are required'
            });
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            firstName,
            lastName,
            gender,
            dob,
            phoneNumber,
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        // Create user data object without password
        const userData = {
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            gender: newUser.gender,
            dob: newUser.dob,
            phoneNumber: newUser.phoneNumber,
            username: newUser.username,
            email: newUser.email
        };

        console.log('Signup successful for user:', userData.username);

        res.status(201).json({
            success: true,
            message: 'User registered successfully!',
            user: userData
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during signup. Please try again.'
        });
    }
});

// Login Route with detailed logging
app.post('/api/login', async (req, res) => {
    console.log('Login request received:', req.body);
    
    try {
        const { usernameOrEmail, password } = req.body;

        // Validate input
        if (!usernameOrEmail || !password) {
            console.log('Missing credentials');
            return res.status(400).json({
                success: false,
                message: 'Username/email and password are required'
            });
        }

        console.log('Looking for user with username/email:', usernameOrEmail);

        // Find user
        const user = await User.findOne({
            $or: [
                { username: usernameOrEmail },
                { email: usernameOrEmail }
            ]
        });

        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username/email or password'
            });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        console.log('Password valid:', isValidPassword ? 'Yes' : 'No');

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username/email or password'
            });
        }

        // Create user data object without password
        const userData = {
            firstName: user.firstName,
            lastName: user.lastName,
            gender: user.gender,
            dob: user.dob,
            phoneNumber: user.phoneNumber,
            username: user.username,
            email: user.email
        };

        console.log('Login successful for user:', userData.username);

        res.json({
            success: true,
            message: 'Login successful!',
            user: userData
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login. Please try again.'
        });
    }
});

// Get user profile
app.get('/api/user/:usernameOrEmail', async (req, res) => {
    try {
        const { usernameOrEmail } = req.params;
        console.log('Fetching user details for:', usernameOrEmail);

        const user = await User.findOne({
            $or: [
                { username: usernameOrEmail },
                { email: usernameOrEmail }
            ]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const userData = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            gender: user.gender,
            dob: user.dob,
            phoneNumber: user.phoneNumber,
            username: user.username,
            email: user.email
        };

        res.json({
            success: true,
            user: userData
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user details'
        });
    }
});

// Task Management Routes

// Get all tasks for a user with optional page type filter
app.get('/api/tasks/:userId', async (req, res) => {
    try {
        const { pageType } = req.query;
        const query = { userId: req.params.userId };
        
        // If pageType is specified, filter by it
        if (pageType) {
            query.pageType = pageType;
        }
        
        const tasks = await Task.find(query).sort({ createdAt: -1 });
        res.json({
            success: true,
            tasks: tasks
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tasks'
        });
    }
});

// Get pending tasks (tasks that have passed their deadline)
app.get('/api/tasks/pending/:userId', async (req, res) => {
    try {
        const currentDate = new Date();
        const tasks = await Task.find({
            userId: req.params.userId,
            deadline: { $lt: currentDate },
            done: false
        }).sort({ deadline: 1 });

        res.json({
            success: true,
            tasks: tasks
        });
    } catch (error) {
        console.error('Error fetching pending tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending tasks'
        });
    }
});

// Add new task
app.post('/api/tasks', async (req, res) => {
    console.log('Received task creation request:', req.body);
    try {
        const { userId, text, priority, deadline, reminder, pageType, category, tags } = req.body;
        
        const task = new Task({
            userId,
            text,
            priority,
            deadline,
            reminder,
            pageType,
            category: category || 'General',
            tags: tags || []
        });

        await task.save();
        res.status(201).json({
            success: true,
            task: task
        });
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding task'
        });
    }
});

// Update task
app.put('/api/tasks/:taskId', async (req, res) => {
    try {
        const { text, priority, deadline, reminder, done, pageType, category, tags } = req.body;
        const task = await Task.findByIdAndUpdate(
            req.params.taskId,
            { text, priority, deadline, reminder, done, pageType, category, tags },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            task: task
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating task'
        });
    }
});

// Delete task
app.delete('/api/tasks/:taskId', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.taskId);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting task'
        });
    }
});

// Update user profile
app.put('/api/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { firstName, lastName, gender, dob, phoneNumber, email } = req.body;

        // Find user and update
        const user = await User.findByIdAndUpdate(
            userId,
            {
                firstName,
                lastName,
                gender,
                dob,
                phoneNumber,
                email
            },
            { new: true } // Return the updated document
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Send back updated user data without password
        const userData = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            gender: user.gender,
            dob: user.dob,
            phoneNumber: user.phoneNumber,
            username: user.username,
            email: user.email
        };

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: userData
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
});

// User verification endpoint for password reset
app.post('/api/user/verify', async (req, res) => {
    try {
        const { username, phoneNumber } = req.body;
        
        // Find user by username and phone number
        const user = await User.findOne({ 
            $and: [
                { $or: [{ username }, { email: username }] },
                { phoneNumber }
            ]
        });

        if (!user) {
            return res.json({ success: false, message: 'Invalid username or phone number' });
        }

        res.json({ success: true, user: user });
    } catch (error) {
        console.error('Error verifying user:', error);
        res.json({ success: false, message: 'Server error' });
    }
});

// Password reset endpoint
app.post('/api/user/reset-password', async (req, res) => {
    try {
        const { userId, newPassword } = req.body;

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.json({ success: false, message: 'Server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});
