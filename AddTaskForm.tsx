import { useState } from "react";

interface AddTaskFormProps {
  onAddTask: (title: string) => void;
}

export default function AddTaskForm({ onAddTask }: AddTaskFormProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAddTask(input.trim());
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 px-4 py-3 rounded-lg border border-teal-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 bg-white text-gray-900 placeholder-gray-500 transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Add Task
        </button>
      </div>
    </form>
  );
}
