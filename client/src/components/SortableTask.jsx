import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Edit2, GripVertical } from 'lucide-react';

export function SortableTask({ 
  task, 
  overdue, 
  editingTaskId, 
  editTitle, 
  setEditTitle, 
  editDescription, 
  setEditDescription, 
  editDueDate, 
  setEditDueDate, 
  editError, 
  handleEditSave, 
  handleEditCancel, 
  handleToggleComplete, 
  handleEditStart, 
  handleDelete 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative',
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div ref={setNodeRef} style={style} className={`task-card ${task.completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}`}>
      {editingTaskId === task.id ? (
        <div className="flex-col gap-sm">
          <input 
            type="text" 
            className="form-control" 
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            placeholder="Task Title *"
          />
          {editError && <div className="form-error">{editError}</div>}
          <textarea 
            className="form-control" 
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
            placeholder="Description"
            rows="2"
          />
          <input 
            type="date" 
            className="form-control" 
            value={editDueDate}
            onChange={e => setEditDueDate(e.target.value)}
          />
          <div className="flex-row" style={{ marginTop: 'var(--spacing-xs)' }}>
            <button className="btn-primary" onClick={() => handleEditSave(task.id)}>Save</button>
            <button className="btn-ghost" onClick={handleEditCancel}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className="task-header">
            <div className="flex-row">
              <div {...attributes} {...listeners} className="drag-handle" style={{ cursor: 'grab', color: 'var(--text-muted)' }}>
                <GripVertical size={16} />
              </div>
              <input 
                type="checkbox" 
                className="checkbox"
                checked={task.completed === 1}
                onChange={() => handleToggleComplete(task.id, task.completed)}
              />
              <div className="task-title">
                {task.title}
                {overdue && <span className="badge-overdue">OVERDUE</span>}
              </div>
            </div>
            <div className="task-actions">
              <button className="btn-icon" onClick={() => handleEditStart(task)}>
                <Edit2 size={16} />
              </button>
              <button className="btn-icon delete" onClick={() => handleDelete(task.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          {task.description && <div className="task-desc">{task.description}</div>}
          <div className="task-meta" style={{ marginLeft: 'var(--spacing-xl)' }}>
            {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
            <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
          </div>
        </>
      )}
    </div>
  );
}
