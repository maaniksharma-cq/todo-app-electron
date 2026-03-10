import './assets/main.css'

import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import TodoList from './pages/todoList'
import CreateTodo from './pages/createTodo'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<TodoList />} />
        <Route path="/createTodo" element={<CreateTodo />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
)
