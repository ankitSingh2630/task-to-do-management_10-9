import React from 'react';

const TaskFilters = ({
  status,
  priority,
  search,
  sortBy,
  sortOrder,
  onStatusChange,
  onPriorityChange,
  onSearchChange,
  onSortByChange,
  onSortOrderChange,
  onReset
}) => {
  const hasActiveFilters = status !== '' || priority !== '' || search !== '' || sortBy !== 'createdAt' || sortOrder !== 'desc';

  return (
    <div className="filters-card">
      <div className="filters-grid">
        {/* Search by title */}
        <div className="filter-item search-item">
          <label htmlFor="filter-search" className="filter-label">
            Search
          </label>
          <div className="search-input-wrapper">
            <input
              id="filter-search"
              type="text"
              className="form-input"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => onSearchChange('')}
                title="Clear search"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Filter by Status */}
        <div className="filter-item">
          <label htmlFor="filter-status" className="filter-label">
            Status
          </label>
          <select
            id="filter-status"
            className="form-select"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Filter by Priority */}
        <div className="filter-item">
          <label htmlFor="filter-priority" className="filter-label">
            Priority
          </label>
          <select
            id="filter-priority"
            className="form-select"
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="filter-item">
          <label htmlFor="filter-sort" className="filter-label">
            Sort By
          </label>
          <div className="sort-group">
            <select
              id="filter-sort"
              className="form-select"
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
            >
              <option value="createdAt">Date Created</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
              <option value="status">Status</option>
            </select>
            <button
              type="button"
              className="btn btn-secondary btn-icon"
              onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={`Sorting ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}. Click to toggle.`}
            >
              {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="filters-footer">
          <button
            type="button"
            className="btn btn-link btn-sm"
            onClick={onReset}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskFilters;
