import TaskItem from './TaskItem.jsx';

function TaskList({ tasks, onToggle, onRemove }) {
  if (tasks.length === 0) {
    return <p className="empty-state">No tasks here yet.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onRemove={onRemove} />
      ))}
    </ul>
  );
}

export default TaskList;
