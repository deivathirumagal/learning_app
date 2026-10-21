import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SearchBar } from '../components/SearchBar';

describe('Unit 5 Experiment 1: SearchBar Component Tests', () => {
  const categories = ['All', 'Web Development', 'Computer Science', 'Database'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  it('renders search input, category select, difficulty select, and filter buttons', () => {
    render(
      <SearchBar
        searchInput=""
        onSearchChange={vi.fn()}
        categoryFilter="All"
        onCategoryChange={vi.fn()}
        difficultyFilter="All"
        onDifficultyChange={vi.fn()}
        onApplyFilters={vi.fn()}
        onResetFilters={vi.fn()}
        categories={categories}
        difficulties={difficulties}
      />
    );

    // Verify search input
    const input = screen.getByPlaceholderText(/search course title, instructor, or topic/i);
    expect(input).toBeInTheDocument();

    // Verify Category dropdown
    const categorySelect = screen.getByLabelText(/category:/i);
    expect(categorySelect).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Web Development' })).toBeInTheDocument();

    // Verify Difficulty dropdown
    const diffSelect = screen.getByLabelText(/difficulty:/i);
    expect(diffSelect).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Intermediate' })).toBeInTheDocument();

    // Verify Filter and Reset buttons
    expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('calls onSearchChange when typing in search input', async () => {
    const handleSearchChange = vi.fn();
    const user = userEvent.setup();

    render(
      <SearchBar
        searchInput=""
        onSearchChange={handleSearchChange}
        categoryFilter="All"
        onCategoryChange={vi.fn()}
        difficultyFilter="All"
        onDifficultyChange={vi.fn()}
        onApplyFilters={vi.fn()}
        onResetFilters={vi.fn()}
        categories={categories}
        difficulties={difficulties}
      />
    );

    const input = screen.getByPlaceholderText(/search course title, instructor, or topic/i);
    await user.type(input, 'React');

    expect(handleSearchChange).toHaveBeenCalled();
  });

  it('calls onCategoryChange when changing category selection', async () => {
    const handleCategoryChange = vi.fn();
    const user = userEvent.setup();

    render(
      <SearchBar
        searchInput=""
        onSearchChange={vi.fn()}
        categoryFilter="All"
        onCategoryChange={handleCategoryChange}
        difficultyFilter="All"
        onDifficultyChange={vi.fn()}
        onApplyFilters={vi.fn()}
        onResetFilters={vi.fn()}
        categories={categories}
        difficulties={difficulties}
      />
    );

    const categorySelect = screen.getByLabelText(/category:/i);
    await user.selectOptions(categorySelect, 'Database');

    expect(handleCategoryChange).toHaveBeenCalledWith('Database');
  });

  it('calls onDifficultyChange when changing difficulty selection', async () => {
    const handleDifficultyChange = vi.fn();
    const user = userEvent.setup();

    render(
      <SearchBar
        searchInput=""
        onSearchChange={vi.fn()}
        categoryFilter="All"
        onCategoryChange={vi.fn()}
        difficultyFilter="All"
        onDifficultyChange={handleDifficultyChange}
        onApplyFilters={vi.fn()}
        onResetFilters={vi.fn()}
        categories={categories}
        difficulties={difficulties}
      />
    );

    const diffSelect = screen.getByLabelText(/difficulty:/i);
    await user.selectOptions(diffSelect, 'Advanced');

    expect(handleDifficultyChange).toHaveBeenCalledWith('Advanced');
  });

  it('calls onResetFilters when clicking Reset button', async () => {
    const handleResetFilters = vi.fn();
    const user = userEvent.setup();

    render(
      <SearchBar
        searchInput="React"
        onSearchChange={vi.fn()}
        categoryFilter="Web Development"
        onCategoryChange={vi.fn()}
        difficultyFilter="Beginner"
        onDifficultyChange={vi.fn()}
        onApplyFilters={vi.fn()}
        onResetFilters={handleResetFilters}
        categories={categories}
        difficulties={difficulties}
      />
    );

    const resetBtn = screen.getByRole('button', { name: /reset/i });
    await user.click(resetBtn);

    expect(handleResetFilters).toHaveBeenCalledTimes(1);
  });
});
