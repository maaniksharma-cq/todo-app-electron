import './assets/main.css'

import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import TodoList from './pages/todoList'
import CreateTodo from './pages/createTodo'
import TodoDetail from './pages/todoDetail'
import SystemInfoPage from './pages/systemInfo'
import { UpdateModal } from './components/UpdateModal'
import { DeepLinkNavigator } from './components/DeepLinkNavigator'

createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<HashRouter>
			<DeepLinkNavigator />
			<Routes>
				<Route path="/" element={<TodoList />} />
				<Route path="/createTodo" element={<CreateTodo />} />
				<Route path="/todo/:id" element={<TodoDetail />} />
				<Route path="/system-info" element={<SystemInfoPage />} />
			</Routes>
		</HashRouter>
		<UpdateModal />
	</React.StrictMode>
)
