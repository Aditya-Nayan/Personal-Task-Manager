# Personal Task Manager
 
A full-stack, single-user task management application. It provides essential task functionalities such as creating, reading, updating, deleting, and drag-and-drop reordering, with SQLite persistence on the backend.

### Live Application (After Deployment)
- **Frontend by Netlify**: App link - [https://comforting-dodol-e9f2df.netlify.app/]
- **Backend by Render**: [https://personal-task-manager-1ivb.onrender.com/]
- **API URL**: [https://personal-task-manager-1ivb.onrender.com/api/tasks]

  ![Personal Task_Manager IMAGE](Task_Manager.png)

### Local Dev
- Frontend: [http://localhost:5174](http://localhost:5173) (Local Dev)
- Backend API: [http://localhost:3001/api/tasks](http://localhost:3001/api/tasks) (Local Dev)

### Tech Stack
- **React (Vite):** Fast, modern frontend framework and bundler for a snappy UI.
- **Node.js & Express:** Lightweight and fast backend for handling API requests.
- **better-sqlite3:** Synchronous, fast, and simple SQLite database for persistent storage without requiring external DB servers.
- **@dnd-kit/core & sortable:** Accessible and customizable drag-and-drop toolkit for list reordering.
- **lucide-react:** Clean and consistent SVG icons for actions like Edit and Delete.
- **uuid:** Generates unique identifiers for newly created tasks.

 *"SQLite resets on server restart due to Render's ephemeral filesystem; would migrate to PostgreSQL for production"*

### How to Run Locally
Ensure you have Node.js installed (v16+ recommended).

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Aditya-Nayan/Personal-Task-Manager.git
   cd "Personal Task Manager"
   ```

2. **Start the Backend Server:**
   ```bash
   cd server
   npm install
   npm run dev
   ```
   *The server will run on http://localhost:3001 and create the `database.db` automatically.*

3. **Start the Frontend Client (in a new terminal tab):**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   *The frontend will run on http://localhost:5174.*

### API Documentation

| Method | Path                 | Request Body                                                                                 | Response Shape                        |
|--------|----------------------|----------------------------------------------------------------------------------------------|---------------------------------------|
| GET    | `/api/tasks`         | *None*                                                                                       | `{ tasks: Task[] }`                   |
| POST   | `/api/tasks`         | `{ title: string, description?: string, due_date?: string }`                                  | `{ task: Task }`                      |
| PUT    | `/api/tasks/:id`     | `{ title?: string, description?: string, due_date?: string, completed?: 0\|1, order_index?: number }` | `{ task: Task }`                      |
| DELETE | `/api/tasks/:id`     | *None*                                                                                       | `{ success: true }`                   |
| PUT    | `/api/tasks/reorder` | `{ orderedIds: string[] }`                                                                   | `{ success: true }`                   |

*(Task shape: `{ id, title, description, due_date, completed, order_index, created_at, updated_at }`)*

- **API URL**: [https://personal-task-manager-1ivb.onrender.com/api/tasks]

### Project Structure
```text
.
├── client/                     # React Frontend App
│   ├── index.html              # HTML Entry Point
│   ├── package.json            # Client Dependencies
│   ├── src/                    # React Source Code
│   │   ├── App.jsx             # Main Application Logic
│   │   ├── components/         # Reusable Components (e.g., SortableTask)
│   │   ├── index.css           # Global Styles and Variables
│   │   └── main.jsx            # React Mounting Point
│   └── vite.config.js          # Vite Config (Proxy to API)
└── server/                     # Node.js Backend App
    ├── index.js                # Express Server and SQLite DB Config
    ├── package.json            # Server Dependencies
    └── database.db             # Generated SQLite DB File
```

### Next Steps
If given more time, the following features would be built next:
1. **New Database:** Plan to migrate from *SQLite* to *PostgreSQL* for persistent storage in production.
2. **Authentication:** Adding JWT-based user authentication to support multiple users.
3. **Categories/Tags:** Allowing tasks to be categorized by custom tags or projects.
4. **Pagination/Virtualization:** Implementing infinite scrolling for the task list to optimize performance with a large number of tasks.
5. **Automated Tests:** Adding Jest/Supertest for backend unit testing, and React Testing Library for frontend component testing.
