import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { todoService } from '@renderer/services/todo.service'
import { ipc } from '@renderer/services/ipc'
import { type Todo } from '../../../../shared/types'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent } from '@renderer/components/ui/card'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { Plus, Trash2, ClipboardList, Monitor } from 'lucide-react'

const TodoList = () => {
  const navigate = useNavigate()
  const [todos, setTodos] = useState<Todo[]>([])

  const fetchTodos = useCallback(async () => {
    const result = await todoService.getAll()
    setTodos(result)
  }, [])

  useEffect(() => {
    fetchTodos()
    const unsubscribe = ipc.on('todos:refresh', () => fetchTodos())
    return () => unsubscribe()
  }, [fetchTodos])

  const handleToggle = async (todo: Todo) => {
    await todoService.update({ ...todo, completed: !todo.completed })
    fetchTodos()
  }

  const handleDelete = async (id: number) => {
    await todoService.delete(id)
    fetchTodos()
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Todos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {todos.filter((t) => t.completed).length} of {todos.length} completed
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon-sm" onClick={() => navigate('/system-info')} title="System Info">
              <Monitor className="size-4" />
            </Button>
            <Button onClick={() => todoService.openCreateWindow()} size="sm">
              <Plus className="size-4" />
              New Todo
            </Button>
          </div>
        </div>

        {/* Todo List */}
        {todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <ClipboardList className="size-12 mb-4 opacity-40" />
            <p className="text-lg font-medium">No todos yet</p>
            <p className="text-sm mt-1">Create your first todo to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => (
              <Card key={todo.id} className="group transition-colors hover:bg-muted/50">
                <CardContent className="flex items-start gap-3 p-4">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => handleToggle(todo)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium leading-snug cursor-pointer hover:underline ${
                        todo.completed ? 'line-through text-muted-foreground' : ''
                      }`}
                      onClick={() => navigate(`/todo/${todo.id}`)}
                    >
                      {todo.title}
                    </p>
                    {todo.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {todo.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(todo.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TodoList
