import React, { useState, useEffect } from 'react';
import { Trash2, Edit2 } from 'lucide-react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, due_date: dueDate })
      });
      
      if (!res.ok) throw new Error('Failed to create task');
      
      const data = await res.json();
      setTasks([data.task, ...tasks]);
      
      // Reset form
      setTitle('');
      setDescription('');
      setDueDate('');
    } catch (err) {
      console.error(err);
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: currentStatus === 1 ? 0 : 1 })
      });
      if (!res.ok) throw new Error('Failed to update task');
      const data = await res.json();
      setTasks(tasks.map(t => t.id === id ? data.task : t));
    } catch (err) {
      console.error(err);
      alert('Failed to update task status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete task');
    }
  };

  return (
    <div className="container">
      <header style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1>Task Manager</h1>
        <div className="subheading">Organize your thoughts</div>
      </header>

      <main>
        <div className="add-task-panel">
          <h2>Add New Task</h2>
          <form onSubmit={handleAddTask} className="flex-col">
            <div className="form-group">
              <label htmlFor="title">Task Title *</label>
              <input 
                id="title"
                type="text" 
                className="form-control" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What needs to be done?"
              />
              {formError && <div className="form-error">{formError}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea 
                id="description"
                className="form-control" 
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows="2"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input 
                id="dueDate"
                type="date" 
                className="form-control" 
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ alignSelf: 'flex-start', marginTop: 'var(--spacing-md)' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </button>
          </form>
        </div>

        {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading tasks...</p>}
        
        {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
        
        {!loading && !error && tasks.length === 0 && (
          <p style={{ color: 'var(--text-secondary)' }}>No tasks found.</p>
        )}

        {!loading && !error && tasks.length > 0 && (
          <div className="task-list">
            {tasks.map(task => (
              <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                <div className="task-header">
                  <div className="flex-row">
                    <input 
                      type="checkbox" 
                      className="checkbox"
                      checked={task.completed === 1}
                      onChange={() => handleToggleComplete(task.id, task.completed)}
                    />
                    <div className="task-title">{task.title}</div>
                  </div>
                  <div className="task-actions">
                    <button className="btn-icon">
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-icon delete" onClick={() => handleDelete(task.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
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
