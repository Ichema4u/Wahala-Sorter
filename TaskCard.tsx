import { Task } from "../types";

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

const formatTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

export default function TaskCard({
  task,
  onDelete,
  onDragStart,
}: TaskCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className="bg-white rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow cursor-move border-l-4 border-teal-500 hover:border-teal-600"
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 break-words">
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">
              {task.column.charAt(0).toUpperCase() + task.column.slice(1)}
            </span>
            <span className="text-xs text-gray-500">
              {formatTime(task.timestamp)}
            </span>
          </div>
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors text-lg leading-none"
          title="Delete task"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
