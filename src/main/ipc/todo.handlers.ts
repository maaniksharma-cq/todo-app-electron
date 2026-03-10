import { getDatabase } from '../database'
import { type CreateTodoInput, type UpdateTodoInput } from '../../../shared/types'

export const createTodoHandler = (todo: CreateTodoInput) => {
  const db = getDatabase()
  const stmt = db.prepare(`INSERT INTO todos (title, description, completed) VALUES (?, ?, ?)`)
  return stmt.run(todo.title, todo.description, todo.completed ? 1 : 0)
}

export const getTodosHandler = () => {
  const db = getDatabase()
  return db.prepare(`SELECT * FROM todos`).all()
}

export const updateTodoHandler = (updateTodo: UpdateTodoInput) => {
  const db = getDatabase()
  const stmt = db.prepare(`UPDATE todos SET title = ?, description = ?, completed = ? WHERE id = ?`)
  return stmt.run(updateTodo.title, updateTodo.description, updateTodo.completed ? 1 : 0, updateTodo.id)
}

export const deleteTodoHandler = (id: number) => {
  const db = getDatabase()
  return db.prepare(`DELETE FROM todos WHERE id = ?`).run(id)
}
