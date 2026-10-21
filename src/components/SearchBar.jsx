import React from 'react';
import { Search, Filter } from 'lucide-react';

export const SearchBar = ({
  searchInput = '',
  onSearchChange,
  categoryFilter = 'All',
  onCategoryChange,
  difficultyFilter = 'All',
  onDifficultyChange,
  onApplyFilters,
  onResetFilters,
  categories = [
    'All',
    'Web Development',
    'Computer Science',
    'Database',
    'Cloud & DevOps',
    'Artificial Intelligence',
    'Security'
  ],
  difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced']
}) => {
  return (
    <div className="filter-panel" data-testid="search-bar-panel">
      <form onSubmit={onApplyFilters} className="filter-form">
        <div className="search-input-group">
          <Search className="search-icon" size={18} aria-hidden="true" />
          <input
            type="text"
            placeholder="Search course title, instructor, or topic..."
            value={searchInput}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="form-input search-box"
            aria-label="Search courses"
          />
        </div>

        <div className="dropdown-group">
          <div className="select-wrap">
            <label htmlFor="cat-select" className="filter-label">
              Category:
            </label>
            <select
              id="cat-select"
              value={categoryFilter}
              onChange={(e) => onCategoryChange && onCategoryChange(e.target.value)}
              className="form-select"
              aria-label="Category Filter"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="select-wrap">
            <label htmlFor="diff-select" className="filter-label">
              Difficulty:
            </label>
            <select
              id="diff-select"
              value={difficultyFilter}
              onChange={(e) => onDifficultyChange && onDifficultyChange(e.target.value)}
              className="form-select"
              aria-label="Difficulty Filter"
            >
              {difficulties.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-filter">
            <Filter size={16} /> Filter
          </button>
          <button type="button" className="btn btn-outline" onClick={onResetFilters}>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};
