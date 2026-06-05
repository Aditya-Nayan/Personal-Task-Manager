import React, { useState, useEffect } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data.tasks);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1>Task Manager</h1>
        <div className="subheading">Organize your thoughts</div>
      </header>

      <main>
        {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading tasks...</p>}
        
        {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
        
        {!loading && !error && tasks.length === 0 && (
          <p style={{ color: 'var(--text-secondary)' }}>No tasks found.</p>
        )}

        {!loading && !error && tasks.length > 0 && (
          <div className="task-list">
            {tasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="task-title">{task.title}</div>
                {task.description && <div className="task-desc">{task.description}</div>}
                <div className="task-meta">
                  {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                  <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
