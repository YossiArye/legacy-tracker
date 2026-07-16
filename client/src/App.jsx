import { useState } from 'react';
import { useTasks } from './hooks/useTasks.js';
import TaskList from './components/TaskList.jsx';
import AddTaskForm from './components/AddTaskForm.jsx';
import FilterBar from './components/FilterBar.jsx';

function App() {
  const { tasks, loading, addTask, toggleComplete, removeTask } = useTasks();
  const [filter, setFilter] = useState('all');

  const visibleTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return (
    <div className="app">
      <h1>TrackIt</h1>
      <AddTaskForm onAdd={addTask} />
      <FilterBar filter={filter} onChange={setFilter} />
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
