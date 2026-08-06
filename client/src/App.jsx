import { useState } from 'react';
import { useTasks } from './hooks/useTasks.js';
import { CATEGORIES } from './constants.js';
import TaskList from './components/TaskList.jsx';
import AddTaskForm from './components/AddTaskForm.jsx';
import FilterBar from './components/FilterBar.jsx';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

const CATEGORY_FILTERS = [
  { value: 'all', label: 'All categories' },
  ...CATEGORIES.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) })),
];

function App() {
  const { tasks, loading, addTask, toggleComplete, removeTask } = useTasks();
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const visibleTasks = tasks.filter((task) => {
    const statusMatch =
      filter === 'active' ? !task.completed :
      filter === 'completed' ? task.completed : true;
    const categoryMatch = categoryFilter === 'all' || task.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  return (
    <div className="app">
      <h1>TrackIt</h1>
      <AddTaskForm onAdd={addTask} />
      <FilterBar options={STATUS_FILTERS} value={filter} onChange={setFilter} />
      <FilterBar options={CATEGORY_FILTERS} value={categoryFilter} onChange={setCategoryFilter} />
      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <TaskList
          tasks={visibleTasks}
          onToggle={toggleComplete}
          onRemove={removeTask}
        />
      )}
    </div>
  );
}

export default App;
