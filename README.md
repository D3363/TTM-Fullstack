🚀 Project Manager ProA Full-Stack Task & Project Management ApplicationProject Manager Pro is a robust web application designed to help teams organize, track, and manage projects and tasks with ease. It features role-based access control, real-time status updates, and a dynamic dashboard for productivity tracking.✨ FeaturesAuthentication & Security: Secure Login and Signup using JWT (JSON Web Tokens).Role-Based Access Control (RBAC):Admin: Can create projects, assign tasks to members, and view global statistics.Member: Can view assigned tasks and update task statuses (Todo, In Progress, Done).Dynamic Dashboard: Real-time stats showing Total, Overdue, and Completed tasks.Responsive UI: Built with React for a smooth, single-page application experience.Full-Stack Integration: Connected to a Node.js/Express backend with a MongoDB database.🛠️ Tech StackFrontend: React.js, CSS3Backend: Node.js, Express.jsDatabase: MongoDBDeployment:Frontend: Vercel / RenderBackend: Railway📂 Project StructurePlaintextTTM-Fullstack/
├── pm-backend/          # Node.js Express Server
│   ├── models/          # Database Schemas
│   ├── routes/          # API Endpoints
│   └── server.js        # Entry point
└── pm-frontend/         # React Application
    ├── src/
    │   ├── App.js       # Main Logic
    │   └── App.css      # Styling
    └── package.json
🚀 Getting StartedPrerequisitesNode.js (v18 or higher)npm or yarnA MongoDB connection stringInstallation & Local SetupClone the RepositoryBashgit clone https://github.com/D3363/TTM-Fullstack.git
cd TTM-Fullstack
Setup the BackendBashcd pm-backend
npm install
# Create a .env file and add your MONGO_URI and JWT_SECRET
npm start
Setup the FrontendBashcd ../pm-frontend
npm install
npm start
The app will be running at http://localhost:3000.📡 API EndpointsMethodEndpointDescriptionPOST/api/auth/signupRegister a new userPOST/api/auth/loginAuthenticate user & get tokenGET/api/projectsFetch all projectsPOST/api/tasksCreate/Assign a new task (Admin only)PUT/api/tasks/:idUpdate task status🔧 ConfigurationTo connect the frontend to your live backend, update the API_URL in pm-frontend/src/App.js:JavaScriptconst API_URL = "https://your-backend-link.railway.app";
👤 AuthorD3363Full-Stack Developer | Project Management Enthusiast
