import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Search, 
  Filter
} from 'lucide-react';
import { 
  fetchCoursesAsync, 
  setFilters, 
  fetchCourseDetailAsync,
  deleteCourseAsync,
  clearDeleteStatus,
  updateCourseAsync,
  clearUpdateStatus
} from '../features/courses/coursesSlice';
import { enrollCourseAsync, clearLearningMessages } from '../features/learning/learningSlice';
import { CourseCard } from '../components/CourseCard';
import { CourseDetailsModal } from '../components/CourseDetailsModal';
import { EditCourseModal } from '../components/EditCourseModal';
import { SearchBar } from '../components/SearchBar';
import { LoadingSpinner, ErrorAlert, SuccessAlert, EmptyState } from '../components/StatusAlerts';

export const CoursesCatalogPage = ({ onNavigateToLogin, onNavigateToDashboard }) => {
  const dispatch = useDispatch();

  const { 
    courses, 
    loading, 
    error, 
    selectedCourse, 
    detailLoading, 
    detailError, 
    filters,
    deleteLoading,
    deleteError,
    deleteSuccess,
    updateLoading,
    updateError,
    updateSuccess
  } = useSelector((state) => state.courses);

  const { enrollments, operationLoading, successMessage, error: learningError } = useSelector((state) => state.learning);
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [categoryFilter, setCategoryFilter] = useState(filters.category || 'All');
  const [difficultyFilter, setDifficultyFilter] = useState(filters.difficulty || 'All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Handle course deletion with confirmation prompt
  const handleDeleteCourse = async (courseId, courseTitle) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this course?");
    if (!isConfirmed) return;

    if (!token) {
      alert("Authentication token required. Please sign in again.");
      return;
    }

    try {
      const actionResult = await dispatch(deleteCourseAsync({ courseId, token }));
      if (deleteCourseAsync.fulfilled.match(actionResult)) {
        if (isModalOpen && selectedCourse && selectedCourse.id === courseId) {
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error("Course deletion error:", err);
    }
  };

  // Open edit modal
  const handleOpenEditCourse = (course) => {
    setEditingCourse(course);
  };

  // Handle save course changes
  const handleSaveEditCourse = async (courseId, updatedData) => {
    if (!token) {
      alert("Authentication token required. Please sign in again.");
      return;
    }

    try {
      const actionResult = await dispatch(updateCourseAsync({
        courseId,
        updatedData,
        token
      }));

      if (updateCourseAsync.fulfilled.match(actionResult)) {
        setEditingCourse(null);
      }
    } catch (err) {
      console.error("Course edit error:", err);
    }
  };

  // Initial load
  useEffect(() => {
    dispatch(fetchCoursesAsync(filters));
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle Search & Filter submit/change
  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    const updatedFilters = {
      search: searchInput,
      category: categoryFilter,
      difficulty: difficultyFilter
    };
    dispatch(setFilters(updatedFilters));
    dispatch(fetchCoursesAsync(updatedFilters));
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchInput('');
    setCategoryFilter('All');
    setDifficultyFilter('All');
    const reset = { search: '', category: 'All', difficulty: 'All' };
    dispatch(setFilters(reset));
    dispatch(fetchCoursesAsync(reset));
  };

  // View course details dynamically
  const handleSelectCourse = (courseId) => {
    setIsModalOpen(true);
    dispatch(fetchCourseDetailAsync(courseId));
  };

  // Enroll in course
  const handleEnroll = (courseId) => {
    if (!isAuthenticated) {
      alert("Please login first! Enrollment is restricted to authenticated students.");
      onNavigateToLogin();
      return;
    }

    dispatch(enrollCourseAsync({
      courseId,
      studentInfo: user,
      token
    }));
  };

  const isCourseEnrolled = (courseId) => {
    return enrollments.some(e => e.courseId === courseId);
  };

  const categories = ['All', 'Web Development', 'Computer Science', 'Database', 'Cloud & DevOps', 'Artificial Intelligence', 'Security'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="page-container">
      <div className="catalog-hero">
        <h2 className="page-heading">Explore Academic Course Catalog</h2>
        <p className="page-subheading">
          Browse university certified computer science & software engineering courses with interactive quizzes, lab assignments, and verifiable certificates.
        </p>
      </div>

      {/* Global Learning and Delete alerts */}
      {successMessage && (
        <SuccessAlert 
          message={successMessage} 
          onClose={() => dispatch(clearLearningMessages())} 
        />
      )}
      {learningError && (
        <ErrorAlert 
          message={learningError} 
          onRetry={() => dispatch(clearLearningMessages())} 
        />
      )}
      {deleteSuccess && (
        <SuccessAlert 
          message={deleteSuccess} 
          onClose={() => dispatch(clearDeleteStatus())} 
        />
      )}
      {deleteError && (
        <ErrorAlert 
          message={deleteError} 
          onRetry={() => dispatch(clearDeleteStatus())} 
        />
      )}
      {updateSuccess && (
        <SuccessAlert 
          message={updateSuccess} 
          onClose={() => dispatch(clearUpdateStatus())} 
        />
      )}
      {updateError && (
        <ErrorAlert 
          message={updateError} 
          onRetry={() => dispatch(clearUpdateStatus())} 
        />
      )}

      {/* Search and Filters Bar */}
      <SearchBar
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        categoryFilter={categoryFilter}
        onCategoryChange={(val) => {
          setCategoryFilter(val);
          const newF = { search: searchInput, category: val, difficulty: difficultyFilter };
          dispatch(setFilters(newF));
          dispatch(fetchCoursesAsync(newF));
        }}
        difficultyFilter={difficultyFilter}
        onDifficultyChange={(val) => {
          setDifficultyFilter(val);
          const newF = { search: searchInput, category: categoryFilter, difficulty: val };
          dispatch(setFilters(newF));
          dispatch(fetchCoursesAsync(newF));
        }}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        categories={categories}
        difficulties={difficulties}
      />

      {/* Main Catalog View States */}
      {loading ? (
        <LoadingSpinner message="Fetching courses from REST API..." />
      ) : error ? (
        <ErrorAlert 
          message={error} 
          onRetry={() => dispatch(fetchCoursesAsync(filters))} 
        />
      ) : courses.length === 0 ? (
        <EmptyState 
          title="No Matching Courses Found" 
          description="Try clearing your search keyword or changing the category filter." 
        />
      ) : (
        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard 
              key={course.id}
              course={course}
              isEnrolled={isCourseEnrolled(course.id)}
              onSelectCourse={handleSelectCourse}
              onEnroll={handleEnroll}
              isEnrolling={operationLoading}
              onDeleteCourse={handleDeleteCourse}
              isDeleting={deleteLoading}
              onEditCourse={handleOpenEditCourse}
            />
          ))}
        </div>
      )}

      {/* Dynamic Course Details Modal */}
      {isModalOpen && (
        <CourseDetailsModal 
          course={selectedCourse}
          loading={detailLoading}
          error={detailError}
          onClose={() => setIsModalOpen(false)}
          onEnroll={handleEnroll}
          isEnrolled={selectedCourse ? isCourseEnrolled(selectedCourse.id) : false}
          isEnrolling={operationLoading}
          onGoToDashboard={() => {
            setIsModalOpen(false);
            onNavigateToDashboard();
          }}
          onRetry={() => selectedCourse?.id && dispatch(fetchCourseDetailAsync(selectedCourse.id))}
          onDeleteCourse={handleDeleteCourse}
          isDeleting={deleteLoading}
          onEditCourse={handleOpenEditCourse}
        />
      )}

      {/* Dynamic Edit Course Modal */}
      {editingCourse && (
        <EditCourseModal 
          course={editingCourse}
          isOpen={Boolean(editingCourse)}
          onClose={() => {
            setEditingCourse(null);
            dispatch(clearUpdateStatus());
          }}
          onSave={handleSaveEditCourse}
          isSaving={updateLoading}
          error={updateError}
        />
      )}
    </div>
  );
};
