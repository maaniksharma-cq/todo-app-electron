import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { todoService } from '@renderer/services/todo.service'
import { type Todo } from '../../../../shared/types'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent } from '@renderer/components/ui/card'
import { ArrowLeft } from 'lucide-react'

const TodoDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [todo, setTodo] = useState<Todo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    todoService.getById(Number(id)).then((result) => {
      setTodo(result)
      setLoading(false)
    })
  }, [id])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-xl">
        <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate('/')}>
          <ArrowLeft className="size-4 mr-1" />
          Back
        </Button>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : !todo ? (
          <p className="text-muted-foreground">Todo not found.</p>
        ) : (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Title</p>
                <p
                  className={`text-lg font-semibold ${todo.completed ? 'line-through text-muted-foreground' : ''}`}
                >
                  {todo.title}
                </p>
              </div>
              {todo.description && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Description
                  </p>
                  <p className="text-sm">{todo.description}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Status</p>
                <p className="text-sm">{todo.completed ? 'Completed' : 'In progress'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Created
                </p>
                <p className="text-sm">{new Date(todo.created_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default TodoDetail
