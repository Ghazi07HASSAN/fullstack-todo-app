// client/src/App.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Todo, User, FilterType } from './types';
import './index.css';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  // Auth States
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  );
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Todo States
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputTitle, setInputTitle] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  // Auth Header Config
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  // 1. Fetch Todos for Logged In User
  const fetchTodos = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/todos`, getAuthHeader());
      setTodos(res.data);
    } catch (err) {
      console.log('Session expired or error fetching todos');
    }
  };

  useEffect(() => {
    if (token) fetchTodos();
  }, [token]);

  // 2. Auth Handlers (Login / Register / Logout)
  const handleAuth = async () => {
    setAuthError('');
    if (!email || !password) {
      setAuthError('Email aur Password dono likhein');
      return;
    }

    const endpoint = isRegistering ? '/auth/register' : '/auth/login';

    try {
      const res = await axios.post(`${API_BASE}${endpoint}`, { email, password });
      const { token: newToken, user: userData } = res.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setAuthError(err.response?.data?.error || 'Authentication Failed!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setTodos([]);
  };

  // 3. Todo Handlers
  const handleAddTodo = async () => {
    if (!inputTitle.trim()) return;
    try {
      const res = await axios.post(`${API_BASE}/todos`, { title: inputTitle }, getAuthHeader());
      setTodos([res.data, ...todos]);
      setInputTitle('');
    } catch (err) {
      alert('Task add nahi ho saka!');
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      const res = await axios.put(
        `${API_BASE}/todos/${todo.id}`,
        { completed: !todo.completed },
        getAuthHeader()
      );
      setTodos(todos.map(t => t.id === todo.id ? res.data : t));
    } catch (err) {
      alert('Update failed!');
    }
  };

  const handleSaveEdit = async (id: number) => {
    if (!editingText.trim()) return;
    try {
      const res = await axios.put(
        `${API_BASE}/todos/${id}`,
        { title: editingText },
        getAuthHeader()
      );
      setTodos(todos.map(t => t.id === id ? res.data : t));
      setEditingId(null);
    } catch (err) {
      alert('Edit failed!');
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await axios.delete(`${API_BASE}/todos/${id}`, getAuthHeader());
      setTodos(todos.filter(t => t.id !== id));
    } catch (err) {
      alert('Delete failed!');
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'ACTIVE') return !todo.completed;
    if (filter === 'COMPLETED') return todo.completed;
    return true;
  });

  // ----------------------------------------------------
  // UNAUTHENTICATED UI (LOGIN / SIGNUP FORM)
  // ----------------------------------------------------
  if (!token) {
    return (
      <div className="app-container">
        <h1 className="title">{isRegistering ? '👤 Create Account' : '🔑 User Login'}</h1>

        {authError && <div className="error-msg">{authError}</div>}

        <div className="auth-box">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
          />
          <button className="btn-auth" onClick={handleAuth}>
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </div>

        <p
          className="auth-toggle"
          onClick={() => {
            setIsRegistering(!isRegistering);
            setAuthError('');
          }}
        >
          {isRegistering
            ? 'Pehle se account hai? Login karein'
            : "Account nahi hai? Naya Sign Up karein"}
        </p>
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED UI (MAIN TODO DASHBOARD)
  // ----------------------------------------------------
  return (
    <div className="app-container">
      {/* Header Bar */}
      <div className="header-bar">
        <span className="user-email">👤 {user?.email}</span>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>

      <h1 className="title">📝 My Todo Dashboard</h1>

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