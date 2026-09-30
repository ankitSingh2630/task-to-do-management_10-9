import React from 'react';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange, onPriorityChange }) => {
  // Format dates cleanly
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper classes for Status
  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'badge-status-completed';
      case 'In Progress':
        return 'badge-status-in-progress';
      case 'Pending':
      default:
        return 'badge-status-pending';
    }
  };

  // Helper classes for Priority
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'badge-priority-high';
      case 'Medium':
        return 'badge-priority-medium';
      case 'Low':
      default:
        return 'badge-priority-low';
    }
  };

  return (
    <div className={`task-card ${task.status === 'Completed' ? 'task-completed' : ''}`}>
      <div className="task-card-header">
        <h4 className="task-title" title={task.title}>
          {task.title}
        </h4>
        <div className="task-badges">
          <span className={`badge ${getStatusClass(task.status)}`}>
            {task.status}
          </span>
          <span className={`badge ${getPriorityClass(task.priority)}`}>
            {task.priority} Priority
          </span>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <div className="task-meta-item">
          <span className="task-meta-label">Due:</span>
          <span className={`task-meta-value ${task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed' ? 'text-danger fw-bold' : ''}`}>
            {formatDate(task.dueDate)}
          </span>
        </div>
        <div className="task-meta-item">
          <span className="task-meta-label">Created:</span>
          <span className="task-meta-value">{formatDateTime(task.createdAt)}</span>
        </div>
        {task.updatedAt && task.updatedAt !== task.createdAt && (
          <div className="task-meta-item">
            <span className="task-meta-label">Updated:</span>
            <span className="task-meta-value">{formatDateTime(task.updatedAt)}</span>
          </div>
        )}
      </div>

      {/* Quick controls for status and priority */}
      <div className="task-quick-controls">
        <div className="quick-control-item">
          <label htmlFor={`status-select-${task._id}`} className="sr-only">Change Status</label>
          <select
            id={`status-select-${task._id}`}
            className="form-select form-select-sm"
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            title="Quickly change status"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="quick-control-item">
          <label htmlFor={`priority-select-${task._id}`} className="sr-only">Change Priority</label>
          <select
            id={`priority-select-${task._id}`}
            className="form-select form-select-sm"
            value={task.priority}
            onChange={(e) => onPriorityChange(task._id, e.target.value)}
            title="Quickly change priority"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      <div className="task-card-actions">
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => onEdit(task)}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={() => onDelete(task)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
