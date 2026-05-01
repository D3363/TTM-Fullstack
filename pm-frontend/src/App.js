import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // ==========================================
  // 1. STATE (The App's Memory)
  // ==========================================
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  
  // !!! CHANGE THIS TO YOUR RAILWAY LINK !!!
  const API_URL = "https://project-manager-backend-production-e7f0.up.railway.app"; 

  // Auth States
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authRole, setAuthRole] = useState('Member');
  const [authError, setAuthError] = useState('');

  // Data States
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]); // For assigning tasks
  const [stats, setStats] = useState({ total: 0, overdue: 0, done: 0 });
  
  // Form States
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskProject, setNewTaskProject] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');

  // ==========================================
  // 2. DATA FETCHING 
  // ==========================================
  // 2. DATA FETCHING 
  // ==========================================
  useEffect(() => {
    if (token) {
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  

  const fetchAllData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Fetch Projects
      const projRes = await fetch(`${API_URL}/api/projects`, { headers });
      if (projRes.ok) setProjects(await projRes.json());

      // Fetch Tasks
      const taskRes = await fetch(`${API_URL}/api/tasks`, { headers });
      if (taskRes.ok) setTasks(await taskRes.json());

      // Fetch Stats
      const statRes = await fetch(`${API_URL}/api/dashboard`, { headers });
      if (statRes.ok) setStats(await statRes.json());

      // Fetch Users (Only if Admin)
      if (role === 'Admin') {
        const userRes = await fetch(`${API_URL}/api/users`, { headers });
        if (userRes.ok) setUsers(await userRes.json());
      }
    } catch (err) { console.error("Failed to fetch data"); }
  };

  // ==========================================
  // 3. ACTIONS
  // ==========================================
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/signup';
    const payload = isLoginMode ? { email, password } : { name, email, password, role: authRole };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");

      if (isLoginMode) {
        setToken(data.token);
        setRole(data.role);
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
      } else {
        alert("Signup successful! You can now log in.");
        setIsLoginMode(true);
      }
    } catch (err) { setAuthError(err.message); }
  };

  const handleLogout = () => {
    setToken(''); setRole('');
    localStorage.removeItem('token'); localStorage.removeItem('role');
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newProjectName, description: newProjectDesc })
      });
      if (res.ok) {
        setNewProjectName(''); setNewProjectDesc('');
        fetchAllData();
      }
    } catch (err) { console.error(err); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          title: newTaskTitle, 
          project: newTaskProject, 
          assignedTo: newTaskAssignee, 
          dueDate: newTaskDate 
        })
      });
      if (res.ok) {
        setNewTaskTitle(''); setNewTaskProject(''); setNewTaskAssignee(''); setNewTaskDate('');
        fetchAllData();
      } else { alert("Failed to create task"); }
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      fetchAllData(); // Refresh to update stats and lists instantly
    } catch (err) { console.error("Failed to update status"); }
  };

  // ==========================================
  // 4. USER INTERFACE
  // ==========================================
  
  if (!token) {
    return (
      <div style={{ padding: '50px', fontFamily: 'Arial', maxWidth: '400px', margin: '0 auto' }}>
        <div style={{ background: '#f4f4f9', padding: '30px', borderRadius: '10px' }}>
          <h2 style={{ textAlign: 'center' }}>{isLoginMode ? 'Login' : 'Sign Up'}</h2>
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {!isLoginMode && (
              <>
                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '10px' }} />
                <select value={authRole} onChange={e => setAuthRole(e.target.value)} style={{ padding: '10px' }}>
                  <option value="Member">Member (Worker)</option>
                  <option value="Admin">Admin (Boss)</option>
                </select>
              </>
            )}
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '10px' }} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '10px' }} />
            <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
              {isLoginMode ? 'Login' : 'Create Account'}
            </button>
            {authError && <p style={{ color: 'red', textAlign: 'center' }}>{authError}</p>}
          </form>
          <p style={{ textAlign: 'center', cursor: 'pointer', color: '#007bff' }} onClick={() => setIsLoginMode(!isLoginMode)}>
            {isLoginMode ? "Sign up here" : "Log in here"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#343a40', color: 'white', padding: '15px 25px', borderRadius: '8px' }}>
        <h2 style={{ margin: 0 }}>Project Manager Pro</h2>
        <div>
          <span style={{ marginRight: '20px', background: role === 'Admin' ? '#dc3545' : '#28a745', padding: '5px 10px', borderRadius: '20px' }}>Role: {role}</span>
          <button onClick={handleLogout} style={{ padding: '8px 15px', background: 'transparent', color: 'white', border: '1px solid white', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ flex: 1, background: '#f8f9fa', padding: '20px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Total Tasks</h3><h1>{stats.total}</h1>
        </div>
        <div style={{ flex: 1, background: '#fff3cd', padding: '20px', textAlign: 'center', border: '1px solid #ffeeba', borderRadius: '8px' }}>
          <h3 style={{ color: '#856404' }}>Overdue</h3><h1 style={{ color: '#856404' }}>{stats.overdue}</h1>
        </div>
        <div style={{ flex: 1, background: '#d4edda', padding: '20px', textAlign: 'center', border: '1px solid #c3e6cb', borderRadius: '8px' }}>
          <h3 style={{ color: '#155724' }}>Completed</h3><h1 style={{ color: '#155724' }}>{stats.done}</h1>
        </div>
      </div>

      {/* ADMIN CONTROLS: Projects & Tasks */}
      {role === 'Admin' && (
        <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
          {/* Create Project Form */}
          <div style={{ flex: 1, background: '#e9ecef', padding: '20px', borderRadius: '8px' }}>
            <h4>Create Project</h4>
            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" placeholder="Project Name" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} required style={{ padding: '8px' }} />
              <input type="text" placeholder="Description" value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)} style={{ padding: '8px' }} />
              <button type="submit" style={{ padding: '8px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>Create Project</button>
            </form>
          </div>

          {/* Create Task Form */}
          <div style={{ flex: 1, background: '#e9ecef', padding: '20px', borderRadius: '8px' }}>
            <h4>Assign New Task</h4>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" placeholder="Task Title" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} required style={{ padding: '8px' }} />
              
              <select value={newTaskProject} onChange={e => setNewTaskProject(e.target.value)} required style={{ padding: '8px' }}>
                <option value="">Select Project...</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>

              <select value={newTaskAssignee} onChange={e => setNewTaskAssignee(e.target.value)} required style={{ padding: '8px' }}>
                <option value="">Assign to Member...</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>

              <input type="date" value={newTaskDate} onChange={e => setNewTaskDate(e.target.value)} required style={{ padding: '8px' }} />
              <button type="submit" style={{ padding: '8px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>Assign Task</button>
            </form>
          </div>
        </div>
      )}

      {/* TASK LIST (For Everyone) */}
      <h3 style={{ marginTop: '40px' }}>{role === 'Admin' ? 'All Assigned Tasks' : 'My Tasks'}</h3>
      {tasks.length === 0 ? <p>No tasks found.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tasks.map(task => (
            <div key={task._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ccc', padding: '15px', borderRadius: '8px', background: 'white' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0' }}>{task.title}</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  Project: <b>{task.project?.name || 'Deleted Project'}</b> | 
                  Assignee: <b>{task.assignedTo?.name || 'Unassigned'}</b> | 
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>
              
              {/* STATUS DROPDOWN */}
              <select 
                value={task.status} 
                onChange={(e) => handleStatusChange(task._id, e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', fontWeight: 'bold', 
                         background: task.status === 'Done' ? '#d4edda' : task.status === 'In Progress' ? '#fff3cd' : '#f8f9fa' }}
              >
                <option value="Todo">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default App;
