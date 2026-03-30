import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  assignMenuToEvent,
  createMenu,
  deleteMenu,
  fetchMenus,
  unassignMenuFromEvent,
} from '../api/menuService';
import { fetchEvents } from '../api/eventService';
import type { Event } from '../types/Event';
import type { Menu } from '../types/Menu';

function MenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuEventId, setNewMenuEventId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [assignTargets, setAssignTargets] = useState<Record<number, string>>(
    {}
  );
  const [busyMenuId, setBusyMenuId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [menuData, eventData] = await Promise.all([
        fetchMenus(),
        fetchEvents(),
      ]);
      setMenus(menuData);
      setEvents(eventData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menus.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const menusByEvent = useMemo(() => {
    return events
      .map((event) => ({
        event,
        menus: menus.filter((menu) =>
          menu.events?.some((e) => e.id === event.id)
        ),
      }))
      .filter((group) => group.menus.length > 0);
  }, [events, menus]);

  const unassignedMenus = useMemo(
    () => menus.filter((menu) => !menu.events || menu.events.length === 0),
    [menus]
  );

  const handleCreateMenu = async () => {
    const name = newMenuName.trim();
    if (!name) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const created = await createMenu({ name });
      if (newMenuEventId) {
        await assignMenuToEvent(created.id, Number(newMenuEventId));
      }

      setNewMenuName('');
      setNewMenuEventId('');
      setIsCreateOpen(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create menu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMenu = async (menu: Menu) => {
    const confirmed = window.confirm(
      `Delete menu "${menu.name}"? This also deletes all items on the menu.`
    );
    if (!confirmed) return;

    setBusyMenuId(menu.id);
    setError(null);
    try {
      await deleteMenu(menu.id);
      setMenus((prev) => prev.filter((m) => m.id !== menu.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete menu.');
    } finally {
      setBusyMenuId(null);
    }
  };

  const handleUnassign = async (menuId: number, eventId: number) => {
    setBusyMenuId(menuId);
    setError(null);
    try {
      await unassignMenuFromEvent(menuId, eventId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unassign menu.');
    } finally {
      setBusyMenuId(null);
    }
  };

  const handleAssign = async (menuId: number) => {
    const selectedEventId = assignTargets[menuId];
    if (!selectedEventId) return;

    setBusyMenuId(menuId);
    setError(null);
    try {
      await assignMenuToEvent(menuId, Number(selectedEventId));
      setAssignTargets((prev) => ({ ...prev, [menuId]: '' }));
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign menu.');
    } finally {
      setBusyMenuId(null);
    }
  };

  if (isLoading) {
    return <div className="alert alert-info">Loading menus...</div>;
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>Menus</h2>
        <button
          className="btn btn-primary btn-sm"
          type="button"
          onClick={() => setIsCreateOpen((prev) => !prev)}
        >
          {isCreateOpen ? 'Cancel' : '+ Create Menu'}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {isCreateOpen && (
        <div className="card p-3 mb-4">
          <div className="row" style={{ rowGap: 'var(--space-3)' }}>
            <div className="col-12 col-md-6">
              <label htmlFor="newMenuName">Menu Name</label>
              <input
                id="newMenuName"
                type="text"
                value={newMenuName}
                onChange={(e) => setNewMenuName(e.target.value)}
                placeholder="e.g. Spring Buffet"
                disabled={isSubmitting}
              />
            </div>
            <div className="col-12 col-md-4">
              <label htmlFor="newMenuEvent">Assign to Event (optional)</label>
              <select
                id="newMenuEvent"
                value={newMenuEventId}
                onChange={(e) => setNewMenuEventId(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">Unassigned for now</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-2 d-flex align-items-end">
              <button
                className="btn btn-primary w-100"
                type="button"
                onClick={() => void handleCreateMenu()}
                disabled={isSubmitting || !newMenuName.trim()}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {menusByEvent.length === 0 && unassignedMenus.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No menus yet</p>
          <p>Create your first reusable menu to get started.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {menusByEvent.map(({ event, menus: eventMenus }) => (
            <div className="card p-3" key={event.id}>
              <div
                className="d-flex justify-content-between align-items-center mb-3"
                style={{ gap: 'var(--space-3)' }}
              >
                <h3 className="mb-0" style={{ fontSize: 'var(--text-lg)' }}>
                  {event.name}
                </h3>
                <Link
                  className="btn btn-sm btn-outline-primary"
                  to={`/events/${event.id}`}
                >
                  View Event
                </Link>
              </div>

              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Menu</th>
                    <th>Items</th>
                    <th>Assigned Events</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {eventMenus.map((menu) => (
                    <tr key={`${event.id}-${menu.id}`}>
                      <td>
                        <Link to={`/menus/${menu.id}/edit`}>{menu.name}</Link>
                      </td>
                      <td>{menu.menuItems?.length ?? 0}</td>
                      <td>{menu.events?.length ?? 0}</td>
                      <td className="d-flex gap-2">
                        <Link
                          className="btn btn-sm btn-outline-primary"
                          to={`/menus/${menu.id}/edit`}
                        >
                          Edit Items
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          type="button"
                          onClick={() => void handleUnassign(menu.id, event.id)}
                          disabled={busyMenuId === menu.id}
                        >
                          Unassign
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          type="button"
                          onClick={() => void handleDeleteMenu(menu)}
                          disabled={busyMenuId === menu.id}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {unassignedMenus.length > 0 && (
            <div className="card p-3">
              <h3 className="mb-3" style={{ fontSize: 'var(--text-lg)' }}>
                Unassigned Menus
              </h3>
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Menu</th>
                    <th>Items</th>
                    <th>Assign To Event</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {unassignedMenus.map((menu) => (
                    <tr key={menu.id}>
                      <td>
                        <Link to={`/menus/${menu.id}/edit`}>{menu.name}</Link>
                      </td>
                      <td>{menu.menuItems?.length ?? 0}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <select
                            value={assignTargets[menu.id] ?? ''}
                            onChange={(e) =>
                              setAssignTargets((prev) => ({
                                ...prev,
                                [menu.id]: e.target.value,
                              }))
                            }
                            disabled={busyMenuId === menu.id}
                          >
                            <option value="">Choose event</option>
                            {events.map((event) => (
                              <option key={event.id} value={event.id}>
                                {event.name}
                              </option>
                            ))}
                          </select>
                          <button
                            className="btn btn-sm btn-primary"
                            type="button"
                            onClick={() => void handleAssign(menu.id)}
                            disabled={
                              busyMenuId === menu.id ||
                              !(assignTargets[menu.id] ?? '').trim()
                            }
                          >
                            Assign
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link
                            className="btn btn-sm btn-outline-primary"
                            to={`/menus/${menu.id}/edit`}
                          >
                            Edit Items
                          </Link>
                          <button
                            className="btn btn-sm btn-danger"
                            type="button"
                            onClick={() => void handleDeleteMenu(menu)}
                            disabled={busyMenuId === menu.id}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MenuPage;
