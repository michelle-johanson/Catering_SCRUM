import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { fetchEventById } from '../api/eventService';
import {
  assignMenuToEvent,
  createMenu,
  fetchMenus,
  fetchMenusByEvent,
  unassignMenuFromEvent,
} from '../api/menuService';
import { createTask, deleteTask, fetchTasksByEvent } from '../api/taskService';
import type { Event } from '../types/Event';
import type { Menu } from '../types/Menu';
import type { Task } from '../types/Task';

function EventDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [activeTab, setActiveTab] = useState<'overview' | 'menus' | 'tasks'>(
    'overview'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newMenuName, setNewMenuName] = useState('');
  const [isAddingMenu, setIsAddingMenu] = useState(false);
  const [existingMenuIdToAssign, setExistingMenuIdToAssign] = useState('');
  const [isAssigningExistingMenu, setIsAssigningExistingMenu] = useState(false);

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskForm, setTaskForm] = useState<{
    title: string;
    description: string;
    status: Task['status'];
    dueDate: string;
  }>({ title: '', description: '', status: 'Pending', dueDate: '' });

  const eventId = useMemo(() => {
    if (!id) return null;
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : null;
  }, [id]);

  useEffect(() => {
    if (!id || eventId === null) {
      setError('Invalid event id.');
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [evt, eventMenus, availableMenus, eventTasks] = await Promise.all(
          [
            fetchEventById(id),
            fetchMenusByEvent(eventId),
            fetchMenus(),
            fetchTasksByEvent(eventId),
          ]
        );

        setEvent(evt);
        setMenus(eventMenus);
        setAllMenus(availableMenus);
        setTasks(eventTasks);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load event.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id, eventId]);

  const formattedDate = useMemo(() => {
    if (!event?.date) return '';
    const d = new Date(event.date);
    if (Number.isNaN(d.getTime())) return event.date;
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, [event?.date]);

  const statusClass = (status: Task['status']) => {
    switch (status) {
      case 'Pending':
        return 'status-badge status-pending';
      case 'InProgress':
        return 'status-badge status-inprogress';
      case 'Done':
        return 'status-badge status-done';
      default:
        return 'status-badge';
    }
  };

  const handleAddMenu = async () => {
    if (!eventId) return;
    const name = newMenuName.trim();
    if (!name) return;

    setIsAddingMenu(true);
    setError(null);
    try {
      const created = await createMenu({ name });
      await assignMenuToEvent(created.id, eventId);
      const refreshedMenus = await fetchMenusByEvent(eventId);
      const refreshedAllMenus = await fetchMenus();
      setMenus(refreshedMenus);
      setAllMenus(refreshedAllMenus);
      setNewMenuName('');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to add menu.';
      setError(message);
    } finally {
      setIsAddingMenu(false);
    }
  };

  const handleUnassignMenu = async (menu: Menu) => {
    if (!eventId) return;
    const ok = window.confirm(`Unassign menu "${menu.name}" from this event?`);
    if (!ok) return;

    setError(null);
    try {
      await unassignMenuFromEvent(menu.id, eventId);
      setMenus((prev) => prev.filter((m) => m.id !== menu.id));
      setAllMenus((prev) =>
        prev.map((m) =>
          m.id === menu.id
            ? {
                ...m,
                events: (m.events ?? []).filter((e) => e.id !== eventId),
              }
            : m
        )
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to unassign menu.';
      setError(message);
    }
  };

  const handleAssignExistingMenu = async () => {
    if (!eventId || !existingMenuIdToAssign) return;

    setIsAssigningExistingMenu(true);
    setError(null);
    try {
      await assignMenuToEvent(Number(existingMenuIdToAssign), eventId);
      const refreshedMenus = await fetchMenusByEvent(eventId);
      const refreshedAllMenus = await fetchMenus();
      setMenus(refreshedMenus);
      setAllMenus(refreshedAllMenus);
      setExistingMenuIdToAssign('');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to assign existing menu.';
      setError(message);
    } finally {
      setIsAssigningExistingMenu(false);
    }
  };

  const handleAddTask = async () => {
    if (!eventId) return;
    const title = taskForm.title.trim();
    if (!title) return;

    setIsAddingTask(true);
    setError(null);
    try {
      const created = await createTask({
        title,
        description: taskForm.description.trim() || undefined,
        status: taskForm.status,
        dueDate: taskForm.dueDate
          ? new Date(taskForm.dueDate).toISOString()
          : undefined,
        eventId,
      });
      setTasks((prev) => [created, ...prev]);
      setTaskForm({
        title: '',
        description: '',
        status: 'Pending',
        dueDate: '',
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to add task.';
      setError(message);
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    const ok = window.confirm(`Delete task "${task.title}"?`);
    if (!ok) return;

    setError(null);
    try {
      await deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete task.';
      setError(message);
    }
  };

  if (isLoading) {
    return (
      <div className="alert alert-info" role="alert">
        Loading event...
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <button
          className="btn btn-secondary mb-3"
          onClick={() => navigate('/events')}
        >
          ← Back
        </button>
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div>
        <button
          className="btn btn-secondary mb-3"
          onClick={() => navigate('/events')}
        >
          ← Back
        </button>
        <div className="alert alert-warning" role="alert">
          Event not found.
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        className="btn btn-secondary mb-3"
        onClick={() => navigate('/events')}
      >
        ← Back
      </button>

      <div className="card p-4">
        <div className="event-detail-header">
          <div>
            <h2 className="event-detail-title">{event.name}</h2>
            <div className="event-meta">
              <span className="event-meta-chip">Date: {formattedDate}</span>
              <span className="event-meta-chip">
                Guests: {event.guestCount}
              </span>
              <span className="event-meta-chip">
                Budget: ${Number(event.budget).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/events/${event.id}/edit`)}
            >
              Edit
            </button>
          </div>
        </div>

        <div className="detail-tabs">
          <button
            className={`detail-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            type="button"
          >
            Overview
          </button>
          <button
            className={`detail-tab ${activeTab === 'menus' ? 'active' : ''}`}
            onClick={() => setActiveTab('menus')}
            type="button"
          >
            Menus
          </button>
          <button
            className={`detail-tab ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
            type="button"
          >
            Tasks
          </button>
        </div>

        <div className="detail-tab-panel">
          {activeTab === 'overview' && (
            <div className="row" style={{ rowGap: 'var(--space-4)' }}>
              <div className="col-12 col-md-6">
                <div className="card p-3">
                  <div className="text-muted mb-1">Event Name</div>
                  <div>{event.name}</div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="card p-3">
                  <div className="text-muted mb-1">Date</div>
                  <div>{formattedDate}</div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="card p-3">
                  <div className="text-muted mb-1">Guest Count</div>
                  <div>{event.guestCount}</div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="card p-3">
                  <div className="text-muted mb-1">Budget</div>
                  <div>${Number(event.budget).toFixed(2)}</div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="card p-3">
                  <div className="text-muted mb-1">Total Sales</div>
                  <div>
                    {event.totalSales != null
                      ? `$${Number(event.totalSales).toFixed(2)}`
                      : '—'}
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="card p-3">
                  <div className="text-muted mb-1">Total Cost</div>
                  <div>
                    {event.totalCost != null
                      ? `$${Number(event.totalCost).toFixed(2)}`
                      : '—'}
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="card p-3">
                  <div className="text-muted mb-1">Food Waste (lbs)</div>
                  <div>
                    {event.foodWasteLbs != null
                      ? Number(event.foodWasteLbs)
                      : '—'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'menus' && (
            <div>
              <div
                className="d-flex gap-2 align-items-end mb-3"
                style={{ flexWrap: 'wrap' }}
              >
                <div style={{ minWidth: '16rem' }}>
                  <label htmlFor="newMenuName">New menu name</label>
                  <input
                    id="newMenuName"
                    type="text"
                    value={newMenuName}
                    onChange={(e) => setNewMenuName(e.target.value)}
                    placeholder="e.g. Dinner Buffet"
                    disabled={isAddingMenu}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => void handleAddMenu()}
                  disabled={isAddingMenu || !newMenuName.trim()}
                >
                  {isAddingMenu ? 'Adding...' : 'Add Menu'}
                </button>
                <div style={{ minWidth: '16rem' }}>
                  <label htmlFor="existingMenu">Assign existing menu</label>
                  <select
                    id="existingMenu"
                    value={existingMenuIdToAssign}
                    onChange={(e) => setExistingMenuIdToAssign(e.target.value)}
                    disabled={isAssigningExistingMenu}
                  >
                    <option value="">Choose menu</option>
                    {allMenus
                      .filter(
                        (m) =>
                          !menus.some(
                            (assignedMenu) => assignedMenu.id === m.id
                          )
                      )
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                  </select>
                </div>
                <button
                  className="btn btn-outline-primary"
                  type="button"
                  onClick={() => void handleAssignExistingMenu()}
                  disabled={isAssigningExistingMenu || !existingMenuIdToAssign}
                >
                  {isAssigningExistingMenu ? 'Assigning...' : 'Assign Existing'}
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => navigate('/menus')}
                >
                  Manage Menus
                </button>
              </div>

              {menus.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-state-title">No menus for this event</p>
                  <p>Add a menu to start tracking menu items.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {menus.map((m) => (
                    <details key={m.id} className="card p-3">
                      <summary className="d-flex justify-content-between align-items-center">
                        <strong>{m.name}</strong>
                        <div className="d-flex gap-2">
                          <Link
                            className="btn btn-sm btn-outline-primary"
                            to={`/menus/${m.id}/edit`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Edit Items
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              void handleUnassignMenu(m);
                            }}
                          >
                            Unassign
                          </button>
                        </div>
                      </summary>

                      <div className="mt-3">
                        {m.menuItems?.length ? (
                          <table className="table table-hover mb-0">
                            <thead>
                              <tr>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Qty Ordered</th>
                                <th>Qty Wasted</th>
                              </tr>
                            </thead>
                            <tbody>
                              {m.menuItems.map((mi) => (
                                <tr key={mi.id}>
                                  <td>{mi.name}</td>
                                  <td>{mi.category}</td>
                                  <td>{mi.quantityOrdered}</td>
                                  <td>{mi.quantityWasted}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div
                            className="text-muted"
                            style={{ fontSize: 'var(--text-sm)' }}
                          >
                            No menu items yet. Add items from the Menus page.
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div>
              <div className="card p-3 mb-3">
                <div className="row" style={{ rowGap: 'var(--space-3)' }}>
                  <div className="col-12 col-md-3">
                    <label htmlFor="taskTitle">Title</label>
                    <input
                      id="taskTitle"
                      type="text"
                      value={taskForm.title}
                      onChange={(e) =>
                        setTaskForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      disabled={isAddingTask}
                      placeholder="e.g. Confirm staffing"
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <label htmlFor="taskDesc">Description</label>
                    <input
                      id="taskDesc"
                      type="text"
                      value={taskForm.description}
                      onChange={(e) =>
                        setTaskForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      disabled={isAddingTask}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="col-6 col-md-2">
                    <label htmlFor="taskStatus">Status</label>
                    <select
                      id="taskStatus"
                      value={taskForm.status}
                      onChange={(e) =>
                        setTaskForm((prev) => ({
                          ...prev,
                          status: e.target.value as Task['status'],
                        }))
                      }
                      disabled={isAddingTask}
                    >
                      <option value="Pending">Pending</option>
                      <option value="InProgress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  <div className="col-6 col-md-2">
                    <label htmlFor="taskDue">Due Date</label>
                    <input
                      id="taskDue"
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) =>
                        setTaskForm((prev) => ({
                          ...prev,
                          dueDate: e.target.value,
                        }))
                      }
                      disabled={isAddingTask}
                    />
                  </div>
                  <div className="col-12 col-md-1 d-flex align-items-end">
                    <button
                      className="btn btn-primary w-100"
                      type="button"
                      onClick={() => void handleAddTask()}
                      disabled={isAddingTask || !taskForm.title.trim()}
                    >
                      {isAddingTask ? '...' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>

              {tasks.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-state-title">No tasks for this event</p>
                  <p>Add a task to track prep and day-of work.</p>
                </div>
              ) : (
                <div className="card p-0">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Due Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((t) => {
                        const due = t.dueDate ? new Date(t.dueDate) : null;
                        const dueLabel =
                          due && !Number.isNaN(due.getTime())
                            ? due.toLocaleDateString()
                            : (t.dueDate ?? '—');
                        return (
                          <tr
                            key={t.id}
                            className={
                              t.status === 'Done' ? 'task-row-done' : undefined
                            }
                          >
                            <td className="task-title">{t.title}</td>
                            <td>{t.description ?? '—'}</td>
                            <td>
                              <span className={statusClass(t.status)}>
                                {t.status}
                              </span>
                            </td>
                            <td>{dueLabel}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-danger"
                                type="button"
                                onClick={() => void handleDeleteTask(t)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventDetailPage;
