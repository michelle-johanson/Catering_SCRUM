import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMenus, createMenu, deleteMenu } from '../api/menuService';
import { fetchEvents } from '../api/eventService';
import type { Menu } from '../types/Menu';
import type { Event } from '../types/Event';

function MenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtering and form state mirroring the Tasks page
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [menusData, eventsData] = await Promise.all([
        fetchMenus(),
        fetchEvents(),
      ]);
      setMenus(menusData);
      setEvents(eventsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = () => {
    setFormData({ name: '' });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      // Create menu as a standalone entity, no event assignment!
      await createMenu({ name: formData.name.trim() });
      setShowForm(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create menu');
    }
  };

  const handleDelete = async (menu: Menu) => {
    if (
      !confirm(`Delete menu "${menu.name}"? This will also delete its items.`)
    )
      return;
    try {
      await deleteMenu(menu.id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete menu');
    }
  };

  const filteredMenus =
    selectedEventId === 'all'
      ? menus
      : selectedEventId === 'unassigned'
        ? menus.filter((m) => !m.events || m.events.length === 0)
        : menus.filter((m) =>
            m.events?.some((e) => e.id === Number(selectedEventId))
          );

  if (loading) return <div className="alert alert-info">Loading menus...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="page-container">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-4)',
        }}
      >
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          Menus
        </h2>
        <button className="btn btn-primary btn-sm" onClick={handleOpenForm}>
          + Add Menu
        </button>
      </div>

      <div className="mb-4 d-flex align-items-center">
        <label className="me-2 fw-bold">Filter by Event:</label>
        <select
          className="form-select w-auto"
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
        >
          <option value="all">All Menus</option>
          <option value="unassigned">Unassigned</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="card mb-4 p-3 shadow-sm border-0">
          <h5>New Menu</h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Menu Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="e.g. Standard Wedding Buffet"
                  required
                />
              </div>
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-success me-2">
                Create
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-responsive bg-white rounded shadow-sm">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Menu Name</th>
              <th>Total Items</th>
              <th>Assigned To Events</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMenus.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-muted">
                  No menus found. Create a standalone menu blueprint to get
                  started!
                </td>
              </tr>
            ) : (
              filteredMenus.map((menu) => {
                const assignedEventNames =
                  menu.events && menu.events.length > 0 ? (
                    menu.events.map((e) => e.name).join(', ')
                  ) : (
                    <span className="text-muted fst-italic">Unassigned</span>
                  );

                return (
                  <tr
                    key={menu.id}
                    style={{ cursor: 'pointer' }}
                    onClick={evt => {
                      // Prevent row click if clicking a button or link
                      const tag = (evt.target as HTMLElement).tagName;
                      if (tag === 'BUTTON' || tag === 'A') return;
                      window.location.href = `/menus/${menu.id}/edit`;
                    }}
                  >
                    <td className="fw-bold">{menu.name}</td>
                    <td>{menu.menuItems?.length || 0}</td>
                    <td>{assignedEventNames}</td>
                    <td>
                      <Link
                        className="btn btn-sm btn-outline-primary me-2"
                        to={`/menus/${menu.id}/edit`}
                        onClick={e => e.stopPropagation()}
                      >
                        Edit Items
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={e => { e.stopPropagation(); handleDelete(menu); }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MenuPage;
