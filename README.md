# Wahala Sorter

A beautiful, minimal task management app built with React, Vite, TypeScript, and Tailwind CSS.

## Features

- ✨ **Three-Column Kanban Board**: Organize tasks into "Now", "Soon", and "Later" columns
- 🎯 **Drag & Drop**: Move tasks between columns using native HTML5 drag API
- ⏱️ **Timestamps**: See when each task was created
- 🗑️ **Delete Tasks**: Remove tasks you no longer need
- 🎨 **Calm Design**: Clean, minimalist interface with a teal color palette
- 💾 **In-Memory State**: Tasks persist during your session

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **HTML5 Drag API** - Drag and drop functionality

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Add a Task**: Type a task in the input field and click "Add Task"
2. **Move Tasks**: Drag tasks between the three columns
3. **Delete Tasks**: Click the ✕ button on any task card
4. **View Details**: Each task shows its title, current column, and timestamp

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (if configured)

## Design Details

The app features:
- **Teal Color Palette**: Multiple shades of teal for a calm, focused feel
- **Flat Design**: Modern, minimal aesthetic with subtle shadows
- **Responsive Layout**: Works on desktop and tablet views
- **Smooth Interactions**: Hover effects and transitions for better UX

## Notes

- All data is stored in component state (memory)
- Tasks are lost when the page is refreshed
- For persistence, consider adding localStorage or a backend

## Future Enhancements

- LocalStorage persistence
- Task editing
- Priority levels
- Categories/Tags
- Dark mode
- Backend integration

---

Made with ❤️ for organized chaos.
