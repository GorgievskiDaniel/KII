import React, { useCallback, useEffect, useState } from "react";
import "./App.css";

type Task = {
  id: number;
  title: string;
  description?: string;
  status: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
};

type PageResult = {
  content: Task[];
  totalPages: number;
  number: number;
  size: number;
  totalElements: number;
};

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("updatedAt");
  const [direction, setDirection] = useState("DESC");
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [pageSize] = useState(5);

  const load = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("size", pageSize.toString());
    params.set("sort", sort);
    params.set("direction", direction);
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("q", search);

    fetch(`/api/tasks?${params.toString()}`)
      .then(res => res.json())
      .then((pageData: PageResult) => {
        setTasks(pageData.content);
        setPageCount(pageData.totalPages);
        setTotalTasks(pageData.totalElements);
      })
      .catch(console.error);
  }, [page, pageSize, sort, direction, statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  const create = () => {
    if (!title.trim()) return;
    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: desc, dueDate })
    })
      .then(res => res.json())
      .then(() => {
        setTitle('');
        setDesc('');
        setDueDate('');
        setPage(0);
        load();
      })
      .catch(console.error);
  };

  const toggleDone = (t: Task) => {
    const newStatus = t.status === 'DONE' ? 'OPEN' : 'DONE';
    fetch(`/api/tasks/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(() => load())
      .catch(console.error);
  };

  const del = (id?: number) => {
    if (!id) return;
    fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      .then(() => load())
      .catch(console.error);
  };

  const formatDate = (value?: string) => value ? new Date(value).toLocaleString() : "-";

  return (
    <div className="App">
      <header className="App-header">
        <div className="topbar">
          <div>
            <h1>Task Manager</h1>
            <p>Track work with filters, sorting, and pagination.</p>
          </div>
          <div className="summary">
            <p>{totalTasks} task{totalTasks === 1 ? '' : 's'}</p>
            <p>Page {page + 1} of {pageCount || 1}</p>
          </div>
        </div>

        <section className="panel">
          <div className="panel-row">
            <input placeholder="Search tasks" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
              <option value="">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="updatedAt">Updated</option>
              <option value="createdAt">Created</option>
              <option value="dueDate">Due Date</option>
              <option value="title">Title</option>
            </select>
            <select value={direction} onChange={e => setDirection(e.target.value)}>
              <option value="DESC">Newest</option>
              <option value="ASC">Oldest</option>
            </select>
          </div>
        </section>

        <section className="panel create-panel">
          <div className="panel-row">
            <input placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} />
            <input placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
            <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            <button onClick={create}>Add task</button>
          </div>
        </section>

        <ul className="tasks">
          {tasks.map(t => (
            <li key={t.id} className={t.status === 'DONE' ? 'done' : ''}>
              <div className="task-meta">
                <div className="task-title">
                  <strong>{t.title}</strong>
                  <span className={`badge ${t.status.toLowerCase()}`}>{t.status.replace('_', ' ')}</span>
                </div>
                <p>{t.description || 'No description provided.'}</p>
                <div className="task-times">
                  <span>Due: {formatDate(t.dueDate)}</span>
                  <span>Updated: {formatDate(t.updatedAt)}</span>
                </div>
              </div>
              <div className="actions">
                <button onClick={() => toggleDone(t)}>{t.status === 'DONE' ? 'Reopen' : 'Done'}</button>
                <button onClick={() => del(t.id)} className="delete">Delete</button>
              </div>
            </li>
          ))}
        </ul>

        <div className="pagination">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>Previous</button>
          <span>{page + 1} / {pageCount || 1}</span>
          <button onClick={() => setPage(Math.min(pageCount - 1, page + 1))} disabled={page + 1 >= pageCount}>Next</button>
        </div>
      </header>
    </div>
  );
}

export default App;
