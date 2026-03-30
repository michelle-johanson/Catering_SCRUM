import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchEventById, updateEvent, saveEventInventory } from '../api/eventService';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import CreateEventModal from '../components/modals/CreateEventModal';
import {
  assignMenuToEvent,
  fetchMenus,
  unassignMenuFromEvent,
} from '../api/menuService';
import { createTask, deleteTask, fetchTasksByEvent } from '../api/taskService';
import { getAuthCompanyId, getAuthUserId } from '../api/loginService';
import type { Event } from '../types/Event';
import type { Menu } from '../types/Menu';
import type { Task } from '../types/Task';

function EventDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [modalOpen, setModalOpen] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // State for inventory tracking
  const [itemQuantities, setItemQuantities] = useState<
    Record<number, { ordered: number; leftover: number }>
  >({});
  const [isSavingInventory, setIsSavingInventory] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'tasks'>(
    'overview'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [existingMenuIdToAssign, setExistingMenuIdToAssign] = useState('');
  const [isAssigningExistingMenu, setIsAssigningExistingMenu] = useState(false);

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [deleteTaskTarget, setDeleteTaskTarget] = useState<Task | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
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

  const loadEventData = async () => {
    if (!eventId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [evt, availableMenus, eventTasks] = await Promise.all([
        fetchEventById(eventId),
        fetchMenus(),
        fetchTasksByEvent(eventId),
      ]);
      setEvent(evt);
      setAllMenus(availableMenus);
      setTasks(eventTasks);

      // Load existing quantities if available
      if (evt.eventMenuItems) {
        const loadedQuantities: Record<
          number,
          { ordered: number; leftover: number }
        > = {};
        evt.eventMenuItems.forEach((emi) => {
          loadedQuantities[emi.menuItemId] = {
            ordered: emi.qtyOrdered,
            leftover: emi.qtyLeftover,
          };
        });
        setItemQuantities(loadedQuantities);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadEventData();
  }, [eventId]);

  const formattedDate = useMemo(() => {
    if (!event?.date) return '';
    const d = new Date(event.date);
    return Number.isNaN(d.getTime()) ? event.date : d.toLocaleDateString();
  }, [event?.date]);

  const handleQuantityChange = (
    menuItemId: number,
    field: 'ordered' | 'leftover',
    value: string
  ) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setItemQuantities((prev) => ({
      ...prev,
      [menuItemId]: {
        ...prev[menuItemId],
        [field]: numValue,
      },
    }));
  };

  // Math Logic!
  const calculateTotals = () => {
    if (!event?.assignedMenu?.menuItems) return;

    let calcTotalCost = 0;
    let calcFoodWaste = 0;

    event.assignedMenu.menuItems.forEach((item) => {
      const qty = itemQuantities[item.id] || { ordered: 0, leftover: 0 };
      calcTotalCost += item.cost * qty.ordered;
      calcFoodWaste += item.servingSizeLb * qty.leftover;
    });

    const calcTotalSales = event.budget - calcTotalCost;

    return { calcTotalCost, calcFoodWaste, calcTotalSales };
  };

  const handleSaveInventory = async () => {
    if (!event || !eventId) return;
    setIsSavingInventory(true);
    setError(null);

    const totals = calculateTotals();
    if (!totals) return;

    try {
      // Save per-item quantities
      const inventoryItems = Object.entries(itemQuantities).map(([menuItemId, qty]) => ({
        menuItemId: Number(menuItemId),
        qtyOrdered: qty.ordered,
        qtyLeftover: qty.leftover,
      }));
      await saveEventInventory(eventId, inventoryItems);

      // Save the calculated totals to the event
      await updateEvent(eventId, {
        id: eventId,
        name: event.name,
        date: event.date,
        guestCount: event.guestCount,
        budget: event.budget,
        totalCost: totals.calcTotalCost,
        totalSales: totals.calcTotalSales,
        foodWasteLbs: totals.calcFoodWaste,
        assignedMenuId: event.assignedMenuId,
        clientName: event.clientName,
        clientContact: event.clientContact,
        companyId: getAuthCompanyId()!,
        createdByUserId: getAuthUserId()!,
      });

      // Re-fetch to show updated totals
      await loadEventData();
    } catch (err) {
      console.error('Save inventory error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save inventory calculations.');
    } finally {
      setIsSavingInventory(false);
    }
  };

  const handleAssignExistingMenu = async () => {
    if (!eventId || !existingMenuIdToAssign) return;
    setIsAssigningExistingMenu(true);
    setError(null);
    try {
      await assignMenuToEvent(Number(existingMenuIdToAssign), eventId);
      await loadEventData();
      setExistingMenuIdToAssign('');
    } catch (err) {
      setError('Failed to assign menu.');
    } finally {
      setIsAssigningExistingMenu(false);
    }
  };

  const handleUnassignMenu = async () => {
    if (!eventId || !event?.assignedMenuId) return;
    if (!window.confirm(`Unassign current menu from this event?`)) return;
    try {
      await unassignMenuFromEvent(event.assignedMenuId, eventId);
      await loadEventData();
    } catch (err) {
      setError('Failed to unassign menu.');
    }
  };

  // Task handlers
  const handleAddTask = async () => {
    if (!eventId || !taskForm.title.trim()) return;
    setIsAddingTask(true);
    try {
      const created = await createTask({
        title: taskForm.title,
        status: taskForm.status,
        dueDate: taskForm.dueDate || null,
        eventId,
        companyId: getAuthCompanyId()!,
      });
      setTasks((prev) => [created, ...prev]);
      setTaskForm({
        title: '',
        description: '',
        status: 'Pending',
        dueDate: '',
      });
    } catch (err) {
      setError('Failed to add task.');
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleConfirmDeleteTask = async () => {
    if (!deleteTaskTarget) return;
    setIsDeletingTask(true);
    try {
      await deleteTask(deleteTaskTarget.id);
      setTasks((prev) => prev.filter((t) => t.id !== deleteTaskTarget.id));
      setDeleteTaskTarget(null);
    } catch (err) {
      setError('Failed to delete task.');
    } finally {
      setIsDeletingTask(false);
    }
  };

  if (isLoading)
    return <div className="alert alert-info">Loading event...</div>;
  if (!event)
    return (
      <div>
        <button
          className="btn btn-secondary mb-3"
          onClick={() => navigate('/events')}
        >
          ← Back
        </button>
        <div className="alert alert-warning">Event not found.</div>
      </div>
    );

  return (
    <div className="page-container">
      <button
        className="btn btn-secondary mb-3"
        onClick={() => navigate('/events')}
      >
        ← Back
      </button>
      {error && <div className="alert alert-danger">{error}</div>}

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
              onClick={() => setModalOpen(true)}
            >
              Edit Event
            </button>
          </div>
        </div>

        <CreateEventModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => void loadEventData()}
          editingEvent={event}
        />

        <div className="detail-tabs">
          <button
            className={`detail-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`detail-tab ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            Assigned Menu
          </button>
          <button
            className={`detail-tab ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks
          </button>
        </div>

        <div className="detail-tab-panel">
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

              {/* Event Details */}
              <div className="card p-4 border-0 shadow-sm">
                <h5 className="section-subtitle mt-0 mb-3">Event Details</h5>
                <div className="row" style={{ rowGap: 'var(--space-3)' }}>
                  <div className="col-6 col-md-3">
                    <div className="text-muted small text-uppercase fw-bold mb-1">Date</div>
                    <div>{formattedDate}</div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-muted small text-uppercase fw-bold mb-1">Guest Count</div>
                    <div>{event.guestCount} people</div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-muted small text-uppercase fw-bold mb-1">Budget</div>
                    <div>${Number(event.budget).toFixed(2)}</div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-muted small text-uppercase fw-bold mb-1">Assigned Menu</div>
                    <div>
                      {event.assignedMenu
                        ? <span className="badge bg-primary">{event.assignedMenu.name}</span>
                        : <span className="text-muted">None assigned</span>}
                    </div>
                  </div>
                  {event.createdByUser && (
                    <div className="col-6 col-md-3">
                      <div className="text-muted small text-uppercase fw-bold mb-1">Created By</div>
                      <div>{event.createdByUser.displayName ?? event.createdByUser.username}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Client Information */}
              <div className="card p-4 border-0 shadow-sm">
                <h5 className="section-subtitle mt-0 mb-3">Client Information</h5>
                <div className="row" style={{ rowGap: 'var(--space-3)' }}>
                  <div className="col-12 col-md-6">
                    <div className="text-muted small text-uppercase fw-bold mb-1">Client Name</div>
                    <div>{event.clientName || <span className="text-muted">—</span>}</div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="text-muted small text-uppercase fw-bold mb-1">Contact</div>
                    <div>{event.clientContact || <span className="text-muted">—</span>}</div>
                  </div>
                </div>
                {!event.clientName && !event.clientContact && (
                  <p className="text-muted small mb-0 mt-2">No client information on file. Use Edit Event to add it.</p>
                )}
              </div>

              {/* Financial Summary */}
              <div className="card p-4 border-0 shadow-sm">
                <h5 className="section-subtitle mt-0 mb-3">Financial Summary</h5>
                <div className="row" style={{ rowGap: 'var(--space-3)' }}>
                  <div className="col-12 col-md-4">
                    <div className="text-muted small text-uppercase fw-bold mb-1">Total Sales</div>
                    <div className="fs-5 fw-semibold">
                      {event.totalSales != null
                        ? `$${Number(event.totalSales).toFixed(2)}`
                        : <span className="text-muted">—</span>}
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="text-muted small text-uppercase fw-bold mb-1">Total Cost</div>
                    <div className="fs-5 fw-semibold">
                      {event.totalCost != null
                        ? `$${Number(event.totalCost).toFixed(2)}`
                        : <span className="text-muted">—</span>}
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="text-muted small text-uppercase fw-bold mb-1">Food Waste</div>
                    <div className="fs-5 fw-semibold">
                      {event.foodWasteLbs != null
                        ? `${Number(event.foodWasteLbs).toFixed(1)} lbs`
                        : <span className="text-muted">—</span>}
                    </div>
                  </div>
                  {event.totalSales != null && event.totalCost != null && (
                    <div className="col-12 col-md-4">
                      <div className="text-muted small text-uppercase fw-bold mb-1">Profit</div>
                      <div className={`fs-5 fw-semibold ${event.totalSales - event.totalCost >= 0 ? 'text-success' : 'text-danger'}`}>
                        ${(event.totalSales - event.totalCost).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
                {(event.totalSales == null || event.totalCost == null) && (
                  <p className="text-muted small mb-0 mt-2">
                    Financials will populate after saving inventory on the Assigned Menu tab.
                  </p>
                )}
              </div>

            </div>
          )}

          {activeTab === 'menu' && (
            <div>
              {!event.assignedMenuId ? (
                <div className="empty-state">
                  <p className="empty-state-title">No Menu Assigned</p>
                  <div className="d-flex gap-2 justify-content-center mt-3">
                    <select
                      className="form-select w-auto"
                      value={existingMenuIdToAssign}
                      onChange={(e) =>
                        setExistingMenuIdToAssign(e.target.value)
                      }
                      disabled={isAssigningExistingMenu}
                    >
                      <option value="">Choose a menu</option>
                      {allMenus.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn btn-primary"
                      onClick={() => void handleAssignExistingMenu()}
                      disabled={
                        isAssigningExistingMenu || !existingMenuIdToAssign
                      }
                    >
                      Assign Menu
                    </button>
                  </div>
                </div>
              ) : (
                <div className="card p-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4>{event.assignedMenu?.name}</h4>
                    <div className="d-flex gap-2">
                      <Link
                        className="btn btn-sm btn-outline-primary"
                        to={`/menus/${event.assignedMenuId}/edit`}
                      >
                        Edit Core Menu Items
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => void handleUnassignMenu()}
                      >
                        Unassign
                      </button>
                    </div>
                  </div>

                  {event.assignedMenu?.menuItems?.length ? (
                    <>
                      <table className="table table-hover mb-4">
                        <thead>
                          <tr>
                            <th>Item Name</th>
                            <th>Cost</th>
                            <th>Serving (lbs)</th>
                            <th className="text-primary">
                              Recommended Qty
                            </th>{' '}
                            {/* NEW COLUMN */}
                            <th>Qty Ordered</th>
                            <th>Qty Leftover</th>
                          </tr>
                        </thead>
                        <tbody>
                          {event.assignedMenu.menuItems.map((mi) => {
                            // THE MATH: (Recommended per 100 / 100) * Total Guests
                            const recommendedQty = Math.ceil(
                              (mi.recommendedPer100Guests / 100) *
                                event.guestCount
                            );

                            return (
                              <tr key={mi.id}>
                                <td>{mi.name}</td>
                                <td>${mi.cost.toFixed(2)}</td>
                                <td>{mi.servingSizeLb} lbs</td>
                                <td className="text-primary fw-bold">
                                  {recommendedQty}
                                </td>{' '}
                                {/* AUTO-CALCULATED! */}
                                <td style={{ width: '150px' }}>
                                  <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    min="0"
                                    value={itemQuantities[mi.id]?.ordered || ''}
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        mi.id,
                                        'ordered',
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td style={{ width: '150px' }}>
                                  <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    min="0"
                                    value={
                                      itemQuantities[mi.id]?.leftover || ''
                                    }
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        mi.id,
                                        'leftover',
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div className="d-flex justify-content-end">
                        <button
                          className="btn btn-primary"
                          onClick={() => void handleSaveInventory()}
                          disabled={isSavingInventory}
                        >
                          {isSavingInventory
                            ? 'Calculating & Saving...'
                            : 'Save Inventory & Calculate Analytics'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-muted">
                      This menu has no items yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="card p-3">
              <div className="row" style={{ rowGap: 'var(--space-3)' }}>
                <div className="col-12 col-md-4">
                  <label>Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={taskForm.title}
                    onChange={(e) =>
                      setTaskForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    disabled={isAddingTask}
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label>Status</label>
                  <select
                    className="form-select"
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
                <div className="col-6 col-md-3">
                  <label>Due Date</label>
                  <input
                    type="date"
                    className="form-control"
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
                <div className="col-12 col-md-2">
                  <label className="invisible">Add</label>
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => void handleAddTask()}
                    disabled={isAddingTask || !taskForm.title.trim()}
                  >
                    Add Task
                  </button>
                </div>
              </div>
              {tasks.length > 0 && (
                <table className="table table-hover mt-4 mb-0">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((t) => (
                      <tr key={t.id}>
                        <td>{t.title}</td>
                        <td>{t.status}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setDeleteTaskTarget(t)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDeleteModal
        open={deleteTaskTarget !== null}
        itemName={deleteTaskTarget?.title ?? ''}
        isDeleting={isDeletingTask}
        onClose={() => setDeleteTaskTarget(null)}
        onConfirm={() => void handleConfirmDeleteTask()}
      />
    </div>
  );
}

export default EventDetailPage;
