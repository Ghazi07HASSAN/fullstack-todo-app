// client/src/App.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Todo, FilterType } from './types';
import './index.css';

const API_URL = 'http://localhost:5000/api/todos';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputTitle, setInputTitle] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  // 1. Fetch Todos from Backend API (with LocalStorage Sync)
  const fetchTodos = async () => {
    try {
      const res = await axios.get(API_URL);
      setTodos(res.data);
      localStorage.setItem('todos_cache', JSON.stringify(res.data));
    } catch (err) {
      console.log('Backend Offline, LocalStorage backup read kar rahe hain...');
      const cached = localStorage.getItem('todos_cache');
      if (cached) setTodos(JSON.parse(cached));
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // 2. Add New Task
  const handleAddTodo = async () => {
    if (!inputTitle.trim()) return;
    try {
      const res = await axios.post(API_URL, { title: inputTitle });
      const updatedTodos = [res.data, ...todos];
      setTodos(updatedTodos);
      localStorage.setItem('todos_cache', JSON.stringify(updatedTodos));
      setInputTitle('');
    } catch (err) {
      alert('Task add nahi ho saka!');
    }
  };

  // 3. Toggle Complete / Incomplete Task
  const handleToggleComplete = async (todo: Todo) => {
    try {
      const res = await axios.put(`${API_URL}/${todo.id}`, {
        completed: !todo.completed
      });
      const updatedTodos = todos.map(t => t.id === todo.id ? res.data : t);
      setTodos(updatedTodos);
      localStorage.setItem('todos_cache', JSON.stringify(updatedTodos));
    } catch (err) {
      alert('Status update nahi hua!');
    }
  };

  // 4. Edit Task Title
  const handleSaveEdit = async (id: number) => {
    if (!editingText.trim()) return;
    try {
      const res = await axios.put(`${API_URL}/${id}`, { title: editingText });
      const updatedTodos = todos.map(t => t.id === id ? res.data : t);
      setTodos(updatedTodos);
      localStorage.setItem('todos_cache', JSON.stringify(updatedTodos));
      setEditingId(null);
    } catch (err) {
      alert('Edit fail ho gaya!');
    }
  };

  // 5. Delete Task
  const handleDeleteTodo = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      const updatedTodos = todos.filter(t => t.id !== id);
      setTodos(updatedTodos);
      localStorage.setItem('todos_cache', JSON.stringify(updatedTodos));
    } catch (err) {
      alert('Delete nahi hua!');
    }
  };

  // 6. Filter Tasks
  const filteredTodos = todos.filter(todo => {
    if (filter === 'ACTIVE') return !todo.completed;
    if (filter === 'COMPLETED') return todo.completed;
    return true; // ALL
  });

  return (
    <div className="app-container">
      <h1 className="title">📝 Full Stack Todo App</h1>

      {/* Input Form */}
      <div className="input-group">
        <input
          type="text"
          placeholder="Naya task likhein..."
          value={inputTitle}
          onChange={(e) => setInputTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
        />
        <button className="btn-add" onClick={handleAddTodo}>Add Task</button>
      </div>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button
          className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          All ({todos.length})
        </button>
        <button
          className={`filter-btn ${filter === 'ACTIVE' ? 'active' : ''}`}
          onClick={() => setFilter('ACTIVE')}
        >
          Active ({todos.filter(t => !t.completed).length})
        </button>
        <button
          className={`filter-btn ${filter === 'COMPLETED' ? 'active' : ''}`}
          onClick={() => setFilter('COMPLETED')}
        >
          Completed ({todos.filter(t => t.completed).length})
        </button>
      </div>

      {/* Task List */}
      <ul className="todo-list">
        {filteredTodos.map((todo) => (
          <li key={todo.id} className="todo-item">
            <div className="todo-left">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleComplete(todo)}
              />
              {editingId === todo.id ? (
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(todo.id)}
                />
              ) : (
                <span className={todo.completed ? 'completed-text' : ''}>
                  {todo.title}
                </span>
              )}
            </div>

            <div>
              {editingId === todo.id ? (
                <button className="btn-add" onClick={() => handleSaveEdit(todo.id)}>Save</button>
              ) : (
                <button
                  className="btn-edit"
                  onClick={() => {
                    setEditingId(todo.id);
                    setEditingText(todo.title);
                  }}
                >
                  Edit
                </button>
              )}
              <button className="btn-delete" onClick={() => handleDeleteTodo(todo.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}