function TaskItem({ task, onToggle, onRemove }) {
  return (
    <li className={`task-item priority-${task.priority} category-${task.category}`}>
      <label>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
        />
        <span className={task.completed ? 'done' : ''}>{task.title}</span>
        <span className="category-badge">{task.category}</span>
      </label>
      <button onClick={() => onRemove(task.id)} aria-label={`Remove ${task.title}`}>
        &times;
      </button>
    </li>
  );
}

export default TaskItem;
