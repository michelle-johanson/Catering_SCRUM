import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchTasks, createTask, updateTask, deleteTask } from '../api/taskService';
import { fetchEvents } from '../api/eventService';
import { getAuthCompanyId } from '../api/loginService';
import type { Task } from '../types/Task';
import type { Event } from '../types/Event';
import '../styles/tasks.css';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const location = useLocation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventId: 'general',
    status: 'Pending',
    dueDate: ''
  });

  useEffect(() => {
    loadData().then((fetchedTasks) => {
      if (location.state?.editTaskId && fetchedTasks) {
        const targetTask = fetchedTasks.find((t: Task) => t.id === location.state.editTaskId);
        if (targetTask) {
          setTimeout(() => handleOpenForm(targetTask), 0);
          window.history.replaceState({}, document.title);
        }
      }
    });
  }, [location.state]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksData, eventsData] = await Promise.all([
        fetchTasks(),
        fetchEvents()
      ]);
      setTasks(tasksData);
      setEvents(eventsData);
      return tasksData;
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (task?: Task) => {
    if (task) {
      setEditingId(task.id);
      setFormData({
        title: task.title,
        description: task.description || '',
        eventId: task.eventId ? String(task.eventId) : 'general',
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        eventId: 'general',
        status: 'Pending',
        dueDate: ''
      });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const payload = {
      ...formData,
      eventId: formData.eventId === 'general' ? null : Number(formData.eventId),
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      companyId: getAuthCompanyId(),
    };

    try {
      if (editingId) {
        await updateTask(editingId, { id: editingId, ...payload });
      } else {
        await createTask(payload);
      }
      setShowForm(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteTask(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTasks = selectedEventId === 'all' 
    ? tasks 
    : selectedEventId === 'general'
      ? tasks.filter(t => t.eventId === null)
      : tasks.filter(t => t.eventId === Number(selectedEventId));

  if (loading) return <div className="alert alert-info">Loading tasks...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>Tasks</h2>
        <button className="btn btn-primary btn-sm" onClick={() => handleOpenForm()}>+ Add Task</button>
      </div>

      <div className="mb-4 d-flex align-items-center">
        <label className="me-2 fw-bold">Filter by Event:</label>
        <select 
          className="form-select w-auto" 
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
        >
          <option value="all">All Events</option>
          <option value="general">General (No Event)</option>
          {events.map(ev => (
            <option key={ev.id} value={ev.id}>{ev.name}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="card mb-4 p-3 shadow-sm border-0">
          <h5>{editingId ? 'Edit Task' : 'New Task'}</h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Title *</label>
                <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Event</label>
                <select className="form-select" value={formData.eventId} onChange={e => setFormData({...formData, eventId: e.target.value})}>
                  <option value="general">General (No Event)</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
              </div>
              <div className="col-md-12">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Status</label>
                <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Pending">Pending</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-control" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
              </div>
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-success me-2">{editingId ? 'Update' : 'Create'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-responsive bg-white rounded shadow-sm mobile-cards-wrapper">
        <table className="table table-hover table-mobile-cards align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Status</th>
              <th>Task</th>
              <th>Event</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-4 text-muted">No tasks found. Create one to be prepared!</td></tr>
            ) : filteredTasks.map(task => {
              const eventName = task.eventId ? (events.find(e => e.id === task.eventId)?.name || 'Unknown') : 'General (No Event)';
              const badgeClass = task.status === 'Done' ? 'bg-success' : task.status === 'InProgress' ? 'bg-warning text-light' : 'bg-secondary';
              
              return (
                <tr key={task.id}>
                  <td data-label="Status"><span className={`badge ${badgeClass}`}>{task.status.replace(/([A-Z])/g, ' $1').trim()}</span></td>
                  <td data-label="Task">
                    <div className="fw-bold text-capitalize">{task.title}</div>
                    {task.description && <div className="text-muted small">{task.description}</div>}
                  </td>
                  <td data-label="Event">{eventName}</td>
                  <td data-label="Due Date">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                  <td data-label="Actions">
                    <div className="d-flex gap-2 justify-content-end">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => handleOpenForm(task)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(task)}>Delete</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <ConfirmDeleteModal
        open={deleteTarget !== null}
        itemName={deleteTarget?.title ?? ''}
        isDeleting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}

export default TasksPage;
