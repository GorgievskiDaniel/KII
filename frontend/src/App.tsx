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

type Parts = { d: string; mo: string; y: string; h: string; mi: string };

const parseParts = (iso: string): Parts => {
  if (!iso) return { d: "", mo: "", y: "", h: "", mi: "" };
  const [date, time = ""] = iso.split("T");
  const [y, mo, d] = date.split("-");
  const [h, mi] = time.split(":");
  return { d: d || "", mo: mo || "", y: y || "", h: h || "", mi: mi || "" };
};

const daysInMonth = (month: number, year: number): number => {
  // new Date(year, month, 0) returns the last day of the previous month
  // (i.e. the last day of `month`), which is exactly what we need here.
  return new Date(year, month, 0).getDate();
};

const validateParts = (p: Parts): string => {
  const d = p.d ? parseInt(p.d, 10) : null;
  const mo = p.mo ? parseInt(p.mo, 10) : null;
  const y = p.y.length === 4 ? parseInt(p.y, 10) : null;
  const h = p.h ? parseInt(p.h, 10) : null;
  const mi = p.mi ? parseInt(p.mi, 10) : null;

  if (mo !== null && (mo < 1 || mo > 12)) {
    return "Month must be between 01 and 12.";
  }
  if (h !== null && h > 24) {
    return "Hour must be between 00 and 24.";
  }
  if (mi !== null && mi > 59) {
    return "Minutes must be between 00 and 59.";
  }
  if (d !== null) {
    const maxDay = mo !== null ? daysInMonth(mo, y ?? 2000) : 31;
    if (d < 1 || d > maxDay) {
      return mo !== null
        ? `Day must be between 01 and ${String(maxDay).padStart(2, "0")} for the selected month.`
        : "Day must be between 01 and 31.";
    }
  }
  if (y !== null && y < 1900) {
    return "Year is not valid.";
  }

  return "";
};

const DateTimeInput = ({
  value,
  onChange,
  onInvalidChange
}: {
  value: string;
  onChange: (v: string) => void;
  onInvalidChange?: (invalid: boolean) => void;
}) => {
  const [parts, setParts] = useState<Parts>(() => parseParts(value));
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setParts(parseParts(value));
    setError("");
    onInvalidChange?.(false);
  }, [value, onInvalidChange]);

  const emit = (next: Parts, hasError: boolean) => {
    if (hasError) return; // не дозволуваме невалидна вредност да стигне до родителот
    // Чекаме секое поле да биде целосно (точен број на цифри) пред да емитуваме
    // нагоре кон родителот. Доколку емитуваме веднаш штом полето има само 1
    // цифра (пр. "2"), вредноста се pad-ира и враќа назад низ `value` пропот
    // додека сѐ уште пишувате, што прави "2" да се претвори во "02" пред да
    // стигнете да внесете втора цифра (пр. "3" за "23").
    const complete =
      next.d.length === 2 &&
      next.mo.length === 2 &&
      next.y.length === 4 &&
      next.h.length === 2 &&
      next.mi.length === 2;
    if (complete) {
      onChange(`${next.y}-${next.mo}-${next.d}T${next.h}:${next.mi}`);
    } else if (!next.d && !next.mo && !next.y && !next.h && !next.mi) {
      onChange("");
    }
  };

  const update = (field: keyof Parts, raw: string) => {
    const maxLen = field === "y" ? 4 : 2;
    const v = raw.replace(/\D/g, "").slice(0, maxLen);
    const next = { ...parts, [field]: v };
    const msg = validateParts(next);
    setParts(next);
    setError(msg);
    onInvalidChange?.(!!msg);
    emit(next, !!msg);
  };

  // Доколку корисникот напише само 1 цифра (пр. "9" за час) и потоа го
  // напушти полето, ја надополнуваме со водечка нула при "blur", за да не
  // мора задолжително да пишува "09".
  const handleBlur = (field: keyof Parts) => {
    if (field === "y") return;
    const current = parts[field];
    if (current.length !== 1) return;
    const next = { ...parts, [field]: current.padStart(2, "0") };
    const msg = validateParts(next);
    setParts(next);
    setError(msg);
    onInvalidChange?.(!!msg);
    emit(next, !!msg);
  };

  return (
    <div className="dt-input-wrapper">
      <div className={`dt-input${error ? " invalid" : ""}`}>
        <input className="dt-num" placeholder="DD" value={parts.d} onChange={e => update("d", e.target.value)} onBlur={() => handleBlur("d")} maxLength={2} />
        <span>/</span>
        <input className="dt-num" placeholder="MM" value={parts.mo} onChange={e => update("mo", e.target.value)} onBlur={() => handleBlur("mo")} maxLength={2} />
        <span>/</span>
        <input className="dt-year" placeholder="YYYY" value={parts.y} onChange={e => update("y", e.target.value)} maxLength={4} />
        <span className="dt-sep">·</span>
        <input className="dt-num" placeholder="HH" value={parts.h} onChange={e => update("h", e.target.value)} onBlur={() => handleBlur("h")} maxLength={2} />
        <span>:</span>
        <input className="dt-num" placeholder="mm" value={parts.mi} onChange={e => update("mi", e.target.value)} onBlur={() => handleBlur("mi")} maxLength={2} />
      </div>
      {error && (
        <p className="dt-error">
          <span className="badge invalid">Invalid</span>
          {" "}
          {error}
        </p>
      )}
    </div>
  );
};

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [direction, setDirection] = useState("DESC");
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [pageSize] = useState(5);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [dueDateInvalid, setDueDateInvalid] = useState(false);
  const [editDueDateInvalid, setEditDueDateInvalid] = useState(false);

  const load = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("size", pageSize.toString());
    params.set("sort", "updatedAt");
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
  }, [page, pageSize, direction, statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  const create = () => {
    if (!title.trim()) return;
    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: desc, dueDate: dueDate || undefined })
    })
      .then(res => res.json())
      .then(() => {
        setTitle("");
        setDesc("");
        setDueDate("");
        setPage(0);
        load();
      })
      .catch(console.error);
  };

  const advanceStatus = (t: Task) => {
    const newStatus = t.status === "OPEN" ? "IN_PROGRESS" : t.status === "IN_PROGRESS" ? "DONE" : "OPEN";
    fetch(`/api/tasks/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    })
      .then(() => load())
      .catch(console.error);
  };

  const statusLabel = (status: string) => {
    if (status === "OPEN") return "In Progress";
    if (status === "IN_PROGRESS") return "Done";
    return "Reopen";
  };

  const startEdit = (t: Task) => {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditDesc(t.description || "");
    setEditDueDate(t.dueDate ? t.dueDate.slice(0, 16) : "");
    setEditStatus(t.status);
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = (id: number) => {
    if (!editTitle.trim()) return;
    const body: Record<string, string> = { title: editTitle, description: editDesc, status: editStatus };
    if (editDueDate) body.dueDate = editDueDate;
    fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(() => { setEditingId(null); load(); })
      .catch(console.error);
  };

  const del = (id?: number) => {
    if (!id) return;
    fetch(`/api/tasks/${id}`, { method: "DELETE" })
      .then(() => load())
      .catch(console.error);
  };

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const d = new Date(value);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="topbar">
          <div>
            <h1>Task Manager</h1>
            <p>Track work with filters, sorting, and pagination.</p>
          </div>
          <div className="summary">
            <p>{totalTasks} task{totalTasks === 1 ? "" : "s"}</p>
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
            <div className="due-date-field">
              <label className="dt-label">Due Date:</label>
              <DateTimeInput value={dueDate} onChange={setDueDate} onInvalidChange={setDueDateInvalid} />
            </div>
            <button
              onClick={create}
              disabled={dueDateInvalid}
              title={dueDateInvalid ? "Fix the due date before adding the task" : undefined}
            >
              Add task
            </button>
          </div>
        </section>

        <ul className="tasks">
          {tasks.map(t => (
            <li key={t.id} className={[t.status === "DONE" ? "done" : "", editingId === t.id ? "editing" : ""].filter(Boolean).join(" ")}>
              {editingId === t.id ? (
                <div className="edit-form">
                  <div className="edit-row">
                    <input placeholder="Title" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                    <input placeholder="Description" value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                    <div className="due-date-field">
                      <label className="dt-label">Due Date:</label>
                      <DateTimeInput value={editDueDate} onChange={setEditDueDate} onInvalidChange={setEditDueDateInvalid} />
                    </div>
                    <select value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                  <div className="edit-actions">
                    <button
                      onClick={() => saveEdit(t.id)}
                      className="save"
                      disabled={editDueDateInvalid}
                      title={editDueDateInvalid ? "Fix the due date before saving" : undefined}
                    >
                      Save
                    </button>
                    <button onClick={cancelEdit} className="cancel">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="task-meta">
                    <div className="task-title">
                      <strong>{t.title}</strong>
                      <span className={`badge ${t.status.toLowerCase()}`}>{t.status.replace("_", " ")}</span>
                    </div>
                    <p>{t.description || "No description provided."}</p>
                    <div className="task-times">
                      <span>Due: {formatDate(t.dueDate)}</span>
                      <span>Created: {formatDate(t.createdAt)}</span>
                      <span>Updated: {formatDate(t.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="actions">
                    <button onClick={() => advanceStatus(t)}>{statusLabel(t.status)}</button>
                    <button onClick={() => startEdit(t)} className="edit">Edit</button>
                    <button onClick={() => del(t.id)} className="delete">Delete</button>
                  </div>
                </>
              )}
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
