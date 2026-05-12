import TaskCard from "./TaskCard";
import { Task, Column } from "../types";

interface ColumnProps {
  title: string;
  columnId: Column;
  tasks: Task[];
  onTaskDelete: (id: string) => void;
  onTaskMove: (taskId: string, targetColumn: Column) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

export default function ColumnComponent({
  title,
  columnId,
  tasks,
  onTaskDelete,
  onTaskMove,
  onDragStart,
}: ColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-teal-50");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-teal-50");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-teal-50");

    const taskId = e.dataTransfer.getData("taskId");
    onTaskMove(taskId, columnId);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="bg-gray-50 rounded-xl p-6 min-h-96 flex flex-col transition-colors"
    >
      <h2 className="text-xl font-semibold text-teal-900 mb-1">{title}</h2>
      <p className="text-sm text-teal-600 mb-4">
        {tasks.length} task{tasks.length !== 1 ? "s" : ""}
      </p>

      <div className="flex-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No tasks yet</p>
            <p className="text-xs mt-1">Drag tasks here to organize them</p>
          </div>
        ) : (
          <div>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={onTaskDelete}
                onDragStart={onDragStart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
