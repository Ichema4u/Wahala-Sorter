import { useState } from 'react';
import ColumnComponent from './components/Column';
import AddTaskForm from './components/AddTaskForm';
import { Task, Column } from './types';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const addTask = (title: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      column: 'now',
      timestamp: new Date(),
    };
    setTasks([newTask, ...tasks]);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const moveTask = (taskId: string, targetColumn: Column) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, column: targetColumn } : task
      )
    );
    setDraggedTaskId(null);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskId', taskId);
  };

  const getTasksByColumn = (column: Column) => {
    return tasks.filter((task) => task.column === column);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white border-b border-teal-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-teal-900">Wahala Sorter</h1>
          <p className="text-teal-600 mt-1">Organize your tasks with ease</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Add Task Form */}
        <AddTaskForm onAddTask={addTask} />

        {/* Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ColumnComponent
            title="Now"
            columnId="now"
            tasks={getTasksByColumn('now')}
            onTaskDelete={deleteTask}
            onTaskMove={moveTask}
            onDragStart={handleDragStart}
          />
          <ColumnComponent
            title="Soon"
            columnId="soon"
            tasks={getTasksByColumn('soon')}
            onTaskDelete={deleteTask}
            onTaskMove={moveTask}
            onDragStart={handleDragStart}
          />
          <ColumnComponent
            title="Later"
            columnId="later"
            tasks={getTasksByColumn('later')}
            onTaskDelete={deleteTask}
            onTaskMove={moveTask}
            onDragStart={handleDragStart}
          />
        </div>

        {/* Summary */}
        {tasks.length > 0 && (
          <div className="mt-8 p-4 bg-white rounded-lg border border-teal-100 text-center">
            <p className="text-teal-700 font-medium">
              Total tasks: <span className="text-teal-900 font-bold">{tasks.length}</span>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
