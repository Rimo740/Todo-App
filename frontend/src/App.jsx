import React, { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function App() {
  const [view, setView] = useState('home') // home | add | about
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // create form state
  const [form, setForm] = useState({ title: '', description: '', dueDate: '' })
  const [editingId, setEditingId] = useState(null)
  const [editingForm, setEditingForm] = useState({})

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/tasks`)
      if (!res.ok) throw new Error('Failed to fetch tasks')
      const data = await res.json()
      setTasks(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function createTask(e) {
    e && e.preventDefault()
    if (!form.title.trim()) return setError('Title is required')
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Create failed')
      }
      const newTask = await res.json()
      setTasks(prev => [newTask, ...prev])
      setForm({ title: '', description: '', dueDate: '' })
      setView('home')
    } catch (err) {
      setError(err.message)
    }
  }

  async function updateTask(id, updates) {
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!res.ok) throw new Error('Update failed')
      const updated = await res.json()
      setTasks(prev => prev.map(t => (t._id === id ? updated : t)))
      setEditingId(null)
    } catch (err) {
      setError(err.message)
    }
  }

  async function deleteTask(id) {
    if (!confirm('Delete this task?')) return
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setTasks(prev => prev.filter(t => t._id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  function startEdit(task) {
    setEditingId(task._id)
    setEditingForm({ title: task.title, description: task.description || '', dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0,10) : '' })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingForm({})
  }

  function toggleComplete(task) {
    updateTask(task._id, { completed: !task.completed })
  }

  const sorted = [...tasks].sort((a,b) => new Date(a.createdAt) < new Date(b.createdAt) ? 1 : -1)

  return (
    <div className="min-h-screen flex flex-col bg-hero bg-cover bg-center text-gray-900">
      {/* Glass header */}
      <header className="w-full backdrop-blur-sm bg-white/20 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-glassPrimary to-glassSecondary shadow-lg flex items-center justify-center text-white font-bold">TD</div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Todo App</h1>
              <p className="text-xs text-white/80">Simple MERN-friendly frontend</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <button onClick={() => setView('home')} className={`px-3 py-2 rounded-md font-medium ${view==='home' ? 'bg-white/30' : 'hover:bg-white/10'}`}>Home</button>
            <button onClick={() => setView('add')} className={`px-3 py-2 rounded-md font-medium ${view==='add' ? 'bg-white/30' : 'hover:bg-white/10'}`}>Add Task</button>
            <button onClick={() => setView('about')} className={`px-3 py-2 rounded-md font-medium ${view==='about' ? 'bg-white/30' : 'hover:bg-white/10'}`}>About</button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full">
        <div className="max-w-5xl mx-auto px-4 py-10">
          {error && <div className="mb-4 text-red-700 bg-red-100 p-3 rounded">{error}</div>}

          {view === 'home' && (
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Your Tasks</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => { fetchTasks(); }} className="px-3 py-2 rounded-md bg-white/20">Refresh</button>
                  <button onClick={() => setView('add')} className="px-3 py-2 rounded-md bg-gradient-to-r from-glassPrimary to-glassSecondary text-white shadow">New Task</button>
                </div>
              </div>

              {loading ? (
                <div className="text-white/90">Loading…</div>
              ) : sorted.length === 0 ? (
                <div className="text-white/70">No tasks yet — add one!</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {sorted.map(task => (
                    <article key={task._id} className="relative p-4 rounded-2xl shadow-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/5 backdrop-blur-md">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className={`text-lg font-bold ${task.completed ? 'line-through text-white/60' : 'text-white'}`}>{task.title}</h3>
                            <span className="ml-auto text-xs text-white/60">{new Date(task.createdAt).toLocaleDateString()}</span>
                          </div>
                          {task.description && <p className={`mt-2 text-sm ${task.completed ? 'text-white/60' : 'text-white/90'}`}>{task.description}</p>}

                          {task.dueDate && <p className="mt-2 text-xs text-yellow-200">Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <button onClick={() => toggleComplete(task)} className="px-3 py-1 rounded-md text-sm bg-white/10">{task.completed ? 'Mark Open' : 'Mark Complete'}</button>
                        <button onClick={() => startEdit(task)} className="px-3 py-1 rounded-md text-sm bg-white/10">Edit</button>
                        <button onClick={() => deleteTask(task._id)} className="px-3 py-1 rounded-md text-sm bg-red-600 text-white">Delete</button>
                      </div>

                      {/* Inline edit area */}
                      {editingId === task._id && (
                        <form onSubmit={e => { e.preventDefault(); updateTask(task._id, editingForm); }} className="mt-4 space-y-2">
                          <input value={editingForm.title} onChange={e => setEditingForm({...editingForm, title: e.target.value})} className="w-full p-2 rounded bg-white/5" placeholder="Title" />
                          <input value={editingForm.dueDate} onChange={e => setEditingForm({...editingForm, dueDate: e.target.value})} type="date" className="w-full p-2 rounded bg-white/5" />
                          <textarea value={editingForm.description} onChange={e => setEditingForm({...editingForm, description: e.target.value})} rows={3} className="w-full p-2 rounded bg-white/5" placeholder="Description" />
                          <div className="flex gap-2">
                            <button type="submit" className="px-3 py-1 rounded bg-gradient-to-r from-glassPrimary to-glassSecondary text-white">Save</button>
                            <button type="button" onClick={cancelEdit} className="px-3 py-1 rounded bg-white/10">Cancel</button>
                          </div>
                        </form>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {view === 'add' && (
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Add a new task</h2>
              <form onSubmit={createTask} className="max-w-2xl bg-white/5 p-6 rounded-2xl backdrop-blur-md border border-white/5">
                <label className="block mb-3">
                  <div className="text-sm text-white/80 mb-1">Title</div>
                  <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full p-3 rounded bg-white/5" placeholder="e.g. Buy groceries" />
                </label>

                <label className="block mb-3">
                  <div className="text-sm text-white/80 mb-1">Description</div>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} className="w-full p-3 rounded bg-white/5" placeholder="Optional details" />
                </label>

                <label className="block mb-6">
                  <div className="text-sm text-white/80 mb-1">Due date</div>
                  <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="p-2 rounded bg-white/5" />
                </label>

                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 rounded bg-gradient-to-r from-glassPrimary to-glassSecondary text-white shadow">Create Task</button>
                  <button type="button" onClick={() => setView('home')} className="px-4 py-2 rounded bg-white/10">Back</button>
                </div>
              </form>
            </section>
          )}

          {view === 'about' && (
            <section className="prose prose-invert max-w-3xl text-white/90">
              <h2>About this app</h2>
              <p>This is a minimal React frontend for your TODO MERN app. It talks to <code>/api/tasks</code> on the server and provides create, read, update, delete operations with a glossy UI.</p>
              <ul>
                <li>Header with navigation buttons</li>
                <li>Glossy gradient background</li>
                <li>Responsive cards with inline edit</li>
                <li>Uses fetch API — no external libraries required</li>
              </ul>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 text-sm text-white/70 flex items-center justify-between">
          <div>© {new Date().getFullYear()} Todo App</div>
          <div>Built for learning • Connects to <code className="bg-white/10 px-2 py-1 rounded">{API_BASE}</code></div>
        </div>
      </footer>
    </div>
  )
}
