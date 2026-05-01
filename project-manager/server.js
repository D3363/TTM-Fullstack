require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const { verifyToken, isAdmin } = require('./middleware/auth');

const app = express();
app.use(express.json());
app.use(cors());

// --- WELCOME ---
app.get('/', (req, res) => res.send('Project Manager API is Live!'));

// --- AUTHENTICATION ---
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json({ message: 'User created' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, role: user.role });
});

// --- PROJECTS (Admins Create, Members View) ---
app.post('/api/projects', verifyToken, isAdmin, async (req, res) => {
  const project = new Project({ ...req.body, owner: req.user.id });
  await project.save();
  res.status(201).json(project);
});

app.get('/api/projects', verifyToken, async (req, res) => {
  const filter = req.user.role === 'Admin' ? {} : { members: req.user.id };
  const projects = await Project.find(filter).populate('members', 'name');
  res.json(projects);
});

// --- TASKS ---
app.post('/api/tasks', verifyToken, isAdmin, async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Fetch tasks (Admins see all, Members see only their own)
app.get('/api/tasks', verifyToken, async (req, res) => {
  const filter = req.user.role === 'Admin' ? {} : { assignedTo: req.user.id };
  // We use .populate() to get the actual names of the project and user instead of just IDs
  const tasks = await Task.find(filter).populate('project', 'name').populate('assignedTo', 'name');
  res.json(tasks);
});

// Update a task's status (Todo -> Done)
app.put('/api/tasks/:id', verifyToken, async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(task);
});

// Fetch members (So the Admin can assign tasks to them)
app.get('/api/users', verifyToken, isAdmin, async (req, res) => {
  const users = await User.find({ role: 'Member' }, 'name email');
  res.json(users);
});

// --- DASHBOARD ---
app.get('/api/dashboard', verifyToken, async (req, res) => {
  const filter = req.user.role === 'Admin' ? {} : { assignedTo: req.user.id };
  const tasks = await Task.find(filter);
  const now = new Date();
  res.json({
    total: tasks.length,
    overdue: tasks.filter(t => t.dueDate < now && t.status !== 'Done').length,
    done: tasks.filter(t => t.status === 'Done').length
  });
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(process.env.PORT || 3000, () => console.log('Server running'));
});