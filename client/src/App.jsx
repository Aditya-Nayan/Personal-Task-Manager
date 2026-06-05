import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, ClipboardList } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableTask } from './components/SortableTask';

const API_BASE = import.meta.env.PROD 
  ? 'https://personal-task-manager-1ivb.onrender.com/api' 
  : '/api';

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

  // Edit state
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editError, setEditError] = useState('');

  // Filter state
  const [filter, setFilter] = useState('All'); // 'All', 'Active', 'Completed'
  const [searchQuery, setSearchQuery] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/tasks`);
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
      const res = await fetch(`${API_BASE}/tasks`, {
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
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
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
      const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete task');
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        // Persist to server
        const orderedIds = newArray.map(item => item.id);
        fetch(`${API_BASE}/tasks/reorder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderedIds })
        }).catch(err => console.error('Failed to reorder tasks:', err));

        return newArray;
      });
    }
  };

  const handleEditStart = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditDueDate(task.due_date || '');
    setEditError('');
  };

  const handleEditCancel = () => {
    setEditingTaskId(null);
  };

  const handleEditSave = async (id) => {
    if (!editTitle.trim()) {
      setEditError('Title is required');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, description: editDescription, due_date: editDueDate })
      });
      if (!res.ok) throw new Error('Failed to update task');
      const data = await res.json();
      setTasks(tasks.map(t => t.id === id ? data.task : t));
      setEditingTaskId(null);
    } catch (err) {
      console.error(err);
      setEditError(err.message);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'Active') return task.completed === 0;
    if (filter === 'Completed') return task.completed === 1;
    return true;
  });

  const activeCount = tasks.filter(t => t.completed === 0 && t.title.toLowerCase().includes(searchQuery.toLowerCase())).length;
  const completedCount = tasks.filter(t => t.completed === 1 && t.title.toLowerCase().includes(searchQuery.toLowerCase())).length;

  const isOverdue = (task) => {
    if (task.completed === 1 || !task.due_date) return false;
    const due = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  const getEmptyStateMessage = () => {
    if (tasks.length === 0) return "Nothing here yet. Add your first task above.";
    if (filter === 'Active') return "No active tasks. You're all caught up!";
    if (filter === 'Completed') return "No completed tasks yet.";
    return "No tasks found matching your search.";
  };

  return (
    <div className="container">
      <header style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <img src="/logo.svg" alt="Task Manager Logo" style={{ height: '120px', width: '200px', background: 'transparent' }} />
        <div>
          <h1 style={{ marginBottom: 0 }}>Task Manager</h1>
          <div className="subheading">Organize your thoughts</div>
        </div>
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

        <div className="filter-bar">
          <div className="flex-col gap-sm">
            <input 
              type="text" 
              className="form-control search-input" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="filter-buttons">
              <button 
                className={`btn-filter ${filter === 'All' ? 'active' : ''}`}
                onClick={() => setFilter('All')}
              >
                All
              </button>
              <button 
                className={`btn-filter ${filter === 'Active' ? 'active' : ''}`}
                onClick={() => setFilter('Active')}
              >
                Active
              </button>
              <button 
                className={`btn-filter ${filter === 'Completed' ? 'active' : ''}`}
                onClick={() => setFilter('Completed')}
              >
                Completed
              </button>
            </div>
          </div>
          <div className="task-counts" style={{ alignSelf: 'flex-end' }}>
            {activeCount} active &middot; {completedCount} completed
          </div>
        </div>

        {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading tasks...</p>}
        
        {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
        
        {!loading && !error && filteredTasks.length === 0 && (
          <div className="empty-state">
            <ClipboardList className="empty-icon" size={48} />
            <p>{getEmptyStateMessage()}</p>
          </div>
        )}

        {!loading && !error && filteredTasks.length > 0 && (
          <div className="task-list">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={filteredTasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredTasks.map(task => (
                  <SortableTask 
                    key={task.id}
                    task={task}
                    overdue={isOverdue(task)}
                    editingTaskId={editingTaskId}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    editDescription={editDescription}
                    setEditDescription={setEditDescription}
                    editDueDate={editDueDate}
                    setEditDueDate={setEditDueDate}
                    editError={editError}
                    handleEditSave={handleEditSave}
                    handleEditCancel={handleEditCancel}
                    handleToggleComplete={handleToggleComplete}
                    handleEditStart={handleEditStart}
                    handleDelete={handleDelete}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
