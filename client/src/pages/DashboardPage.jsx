import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskApi } from '../services/api';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskFilters from '../components/TaskFilters';
import TaskFormModal from '../components/TaskFormModal';
import ConfirmModal from '../components/ConfirmModal';
import Alert from '../components/Alert';

const DashboardPage = () => {
  const { user } = useAuth();

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await taskApi.getTasks({
        status: statusFilter,
        priority: priorityFilter,
        search: searchQuery,
        sortBy,
        sortOrder
      });
      if (res.success) {
        setTasks(res.tasks || []);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || 'Failed to fetch tasks. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, searchQuery, sortBy, sortOrder]);

  // Debounced search / trigger on filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 200);

    return () => clearTimeout(timer);
  }, [fetchTasks]);

  // Handle Create Task click
  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setIsFormModalOpen(true);
  };

  // Handle Edit Task click
  const handleOpenEditModal = (task) => {
    setTaskToEdit(task);
    setIsFormModalOpen(true);
  };

  // Save Task (Create or Update)
  const handleSaveTask = async (taskData) => {
    setFormSubmitting(true);
    try {
      if (taskToEdit && taskToEdit._id) {
        // Update task
        const res = await taskApi.updateTask(taskToEdit._id, taskData);
        if (res.success) {
          setAlert({ type: 'success', message: 'Task updated successfully!' });
          setIsFormModalOpen(false);
          setTaskToEdit(null);
          fetchTasks();
        }
      } else {
        // Create new task
        const res = await taskApi.createTask(taskData);
        if (res.success) {
          setAlert({ type: 'success', message: 'Task created successfully!' });
          setIsFormModalOpen(false);
          fetchTasks();
        }
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || 'Error saving task'
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Delete Confirmation
  const handleOpenDeleteModal = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setDeleteSubmitting(true);
    try {
      const res = await taskApi.deleteTask(taskToDelete._id);
      if (res.success) {
        setAlert({ type: 'success', message: 'Task deleted successfully!' });
        setIsDeleteModalOpen(false);
        setTaskToDelete(null);
        fetchTasks();
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || 'Failed to delete task'
      });
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Quick Status change directly on card
  const handleQuickStatusChange = async (taskId, newStatus) => {
    try {
      const res = await taskApi.updateTask(taskId, { status: newStatus });
      if (res.success) {
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t._id === taskId ? res.task : t))
        );
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || 'Failed to update status'
      });
    }
  };

  // Quick Priority change directly on card
  const handleQuickPriorityChange = async (taskId, newPriority) => {
    try {
      const res = await taskApi.updateTask(taskId, { priority: newPriority });
      if (res.success) {
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t._id === taskId ? res.task : t))
        );
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || 'Failed to update priority'
      });
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setSearchQuery('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  // Compute stats for overview
  const totalTasks = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-content">
        <div className="container">
          {/* Top Banner & Action */}
          <div className="dashboard-topbar">
            <div>
              <h2 className="dashboard-heading">My Tasks</h2>
              <p className="dashboard-subheading">
                Organize, track, and complete your tasks efficiently.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOpenCreateModal}
            >
              + Create Task
            </button>
          </div>

          {/* Alert Notification */}
          {alert.message && (
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert({ type: '', message: '' })}
            />
          )}

          {/* Quick Summary Counter */}
          <div className="summary-cards">
            <div className="summary-card">
              <span className="summary-label">Total Tasks</span>
              <span className="summary-value">{totalTasks}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Pending</span>
              <span className="summary-value text-warning">{pendingCount}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">In Progress</span>
              <span className="summary-value text-info">{inProgressCount}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Completed</span>
              <span className="summary-value text-success">{completedCount}</span>
            </div>
          </div>

          {/* Filters and Search */}
          <TaskFilters
            status={statusFilter}
            priority={priorityFilter}
            search={searchQuery}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onStatusChange={setStatusFilter}
            onPriorityChange={setPriorityFilter}
            onSearchChange={setSearchQuery}
            onSortByChange={setSortBy}
            onSortOrderChange={setSortOrder}
            onReset={handleResetFilters}
          />

          {/* Task List or States */}
          <section className="tasks-section" aria-label="Task List">
            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Loading your tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <h3 className="empty-state-title">
                  {statusFilter || priorityFilter || searchQuery
                    ? 'No matching tasks found'
                    : 'No tasks yet'}
                </h3>
                <p className="empty-state-message">
                  {statusFilter || priorityFilter || searchQuery
                    ? 'Try adjusting your search criteria or resetting filters.'
                    : 'Get started by creating your first task!'}
                </p>
                {statusFilter || priorityFilter || searchQuery ? (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleResetFilters}
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleOpenCreateModal}
                  >
                    + Create Your First Task
                  </button>
                )}
              </div>
            ) : (
              <div className="tasks-grid">
                {tasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={handleOpenEditModal}
                    onDelete={handleOpenDeleteModal}
                    onStatusChange={handleQuickStatusChange}
                    onPriorityChange={handleQuickPriorityChange}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Create / Edit Task Modal */}
      <TaskFormModal
        isOpen={isFormModalOpen}
        task={taskToEdit}
        loading={formSubmitting}
        onSave={handleSaveTask}
        onClose={() => {
          setIsFormModalOpen(false);
          setTaskToEdit(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDanger={true}
        loading={deleteSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
      />
    </div>
  );
};

export default DashboardPage;
