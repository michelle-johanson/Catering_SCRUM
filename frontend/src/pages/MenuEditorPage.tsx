import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchEvents } from '../api/eventService';
import {
  assignMenuToEvent,
  createMenuItem,
  deleteMenuItem,
  fetchMenuById,
  unassignMenuFromEvent,
  updateMenu,
  updateMenuItem,
} from '../api/menuService';
import type { Event } from '../types/Event';
import type { Menu } from '../types/Menu';
import type { MenuItem } from '../types/MenuItem';

type ItemFormState = {
  name: string;
  category: string;
  quantityOrdered: string;
  quantityWasted: string;
};

const initialItemForm: ItemFormState = {
  name: '',
  category: '',
  quantityOrdered: '1',
  quantityWasted: '0',
};

function MenuEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [menu, setMenu] = useState<Menu | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [menuName, setMenuName] = useState('');
  const [isSavingMenu, setIsSavingMenu] = useState(false);

  const [itemForm, setItemForm] = useState<ItemFormState>(initialItemForm);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [busyEventId, setBusyEventId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!id) {
      setError('Invalid menu id.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [menuData, eventData] = await Promise.all([
        fetchMenuById(id),
        fetchEvents(),
      ]);
      setMenu(menuData);
      setMenuName(menuData.name);
      setEvents(eventData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menu.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const assignedEventIds = useMemo(
    () => new Set((menu?.events ?? []).map((event) => event.id)),
    [menu?.events]
  );

  const resetItemForm = () => {
    setItemForm(initialItemForm);
    setEditingItemId(null);
  };

  const handleSaveMenu = async () => {
    if (!menu) return;
    const trimmed = menuName.trim();
    if (!trimmed) return;

    setIsSavingMenu(true);
    setError(null);
    try {
      await updateMenu(menu.id, {
        id: menu.id,
        name: trimmed,
      });

      setMenu((prev) => (prev ? { ...prev, name: trimmed } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update menu.');
    } finally {
      setIsSavingMenu(false);
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItemId(item.id);
    setItemForm({
      name: item.name,
      category: item.category,
      quantityOrdered: String(item.quantityOrdered),
      quantityWasted: String(item.quantityWasted),
    });
  };

  const handleSaveItem = async () => {
    if (!menu) return;

    const name = itemForm.name.trim();
    const category = itemForm.category.trim();
    const quantityOrdered = Number(itemForm.quantityOrdered);
    const quantityWasted = Number(itemForm.quantityWasted);

    if (
      !name ||
      !category ||
      !Number.isInteger(quantityOrdered) ||
      quantityOrdered < 1
    ) {
      setError('Item name, category, and quantity ordered are required.');
      return;
    }

    if (!Number.isInteger(quantityWasted) || quantityWasted < 0) {
      setError('Quantity wasted must be 0 or greater.');
      return;
    }

    setIsSavingItem(true);
    setError(null);
    try {
      if (editingItemId === null) {
        const created = await createMenuItem({
          name,
          category,
          quantityOrdered,
          quantityWasted,
          menuId: menu.id,
        });

        setMenu((prev) =>
          prev
            ? {
                ...prev,
                menuItems: [...(prev.menuItems ?? []), created],
              }
            : prev
        );
      } else {
        await updateMenuItem(editingItemId, {
          id: editingItemId,
          name,
          category,
          quantityOrdered,
          quantityWasted,
          menuId: menu.id,
        });

        setMenu((prev) =>
          prev
            ? {
                ...prev,
                menuItems: (prev.menuItems ?? []).map((item) =>
                  item.id === editingItemId
                    ? {
                        ...item,
                        name,
                        category,
                        quantityOrdered,
                        quantityWasted,
                      }
                    : item
                ),
              }
            : prev
        );
      }

      resetItemForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save menu item.'
      );
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleDeleteItem = async (item: MenuItem) => {
    if (!menu) return;
    const confirmed = window.confirm(`Delete menu item "${item.name}"?`);
    if (!confirmed) return;

    setIsSavingItem(true);
    setError(null);
    try {
      await deleteMenuItem(item.id);
      setMenu((prev) =>
        prev
          ? {
              ...prev,
              menuItems: (prev.menuItems ?? []).filter(
                (mi) => mi.id !== item.id
              ),
            }
          : prev
      );

      if (editingItemId === item.id) {
        resetItemForm();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete menu item.'
      );
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleAssignmentToggle = async (eventId: number) => {
    if (!menu) return;

    setBusyEventId(eventId);
    setError(null);
    try {
      if (assignedEventIds.has(eventId)) {
        await unassignMenuFromEvent(menu.id, eventId);
      } else {
        await assignMenuToEvent(menu.id, eventId);
      }
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update assignments.'
      );
    } finally {
      setBusyEventId(null);
    }
  };

  if (isLoading) {
    return <div className="alert alert-info">Loading menu...</div>;
  }

  if (!menu) {
    return (
      <div>
        <button
          className="btn btn-secondary mb-3"
          onClick={() => navigate('/menus')}
        >
          Back
        </button>
        <div className="alert alert-warning">Menu not found.</div>
      </div>
    );
  }

  return (
    <div>
      <button
        className="btn btn-secondary mb-3"
        onClick={() => navigate('/menus')}
      >
        Back
      </button>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card p-4 mb-4">
        <h2 className="mb-3">Edit Menu</h2>
        <div className="row" style={{ rowGap: 'var(--space-3)' }}>
          <div className="col-12 col-md-8">
            <label htmlFor="menuName">Menu Name</label>
            <input
              id="menuName"
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
              disabled={isSavingMenu}
            />
          </div>
          <div className="col-12 col-md-4 d-flex align-items-end">
            <button
              className="btn btn-primary w-100"
              type="button"
              onClick={() => void handleSaveMenu()}
              disabled={isSavingMenu || !menuName.trim()}
            >
              {isSavingMenu ? 'Saving...' : 'Save Name'}
            </button>
          </div>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <h3 className="mb-3" style={{ fontSize: 'var(--text-xl)' }}>
          Assign To Events
        </h3>
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const isAssigned = assignedEventIds.has(event.id);
              return (
                <tr key={event.id}>
                  <td>{event.name}</td>
                  <td>{new Date(event.date).toLocaleDateString()}</td>
                  <td>{isAssigned ? 'Assigned' : 'Not Assigned'}</td>
                  <td>
                    <button
                      className={`btn btn-sm ${isAssigned ? 'btn-outline-secondary' : 'btn-primary'}`}
                      type="button"
                      disabled={busyEventId === event.id}
                      onClick={() => void handleAssignmentToggle(event.id)}
                    >
                      {isAssigned ? 'Unassign' : 'Assign'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card p-4">
        <h3 className="mb-3" style={{ fontSize: 'var(--text-xl)' }}>
          Menu Items
        </h3>

        {(menu.menuItems ?? []).length === 0 ? (
          <p className="text-muted">
            No items yet. Add your first menu item below.
          </p>
        ) : (
          <table className="table table-hover mb-4">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Qty Ordered</th>
                <th>Qty Wasted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(menu.menuItems ?? []).map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.quantityOrdered}</td>
                  <td>{item.quantityWasted}</td>
                  <td className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      type="button"
                      onClick={() => handleEditItem(item)}
                      disabled={isSavingItem}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      type="button"
                      onClick={() => void handleDeleteItem(item)}
                      disabled={isSavingItem}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="row" style={{ rowGap: 'var(--space-3)' }}>
          <div className="col-12 col-md-3">
            <label htmlFor="itemName">Item Name</label>
            <input
              id="itemName"
              value={itemForm.name}
              onChange={(e) =>
                setItemForm((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={isSavingItem}
            />
          </div>
          <div className="col-12 col-md-3">
            <label htmlFor="itemCategory">Category</label>
            <input
              id="itemCategory"
              value={itemForm.category}
              onChange={(e) =>
                setItemForm((prev) => ({ ...prev, category: e.target.value }))
              }
              disabled={isSavingItem}
            />
          </div>
          <div className="col-6 col-md-2">
            <label htmlFor="itemQtyOrdered">Qty Ordered</label>
            <input
              id="itemQtyOrdered"
              type="number"
              min={1}
              value={itemForm.quantityOrdered}
              onChange={(e) =>
                setItemForm((prev) => ({
                  ...prev,
                  quantityOrdered: e.target.value,
                }))
              }
              disabled={isSavingItem}
            />
          </div>
          <div className="col-6 col-md-2">
            <label htmlFor="itemQtyWasted">Qty Wasted</label>
            <input
              id="itemQtyWasted"
              type="number"
              min={0}
              value={itemForm.quantityWasted}
              onChange={(e) =>
                setItemForm((prev) => ({
                  ...prev,
                  quantityWasted: e.target.value,
                }))
              }
              disabled={isSavingItem}
            />
          </div>
          <div className="col-12 col-md-2 d-flex align-items-end gap-2">
            <button
              className="btn btn-primary w-100"
              type="button"
              onClick={() => void handleSaveItem()}
              disabled={isSavingItem}
            >
              {isSavingItem ? 'Saving...' : editingItemId ? 'Update' : 'Add'}
            </button>
            {editingItemId !== null && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={resetItemForm}
                disabled={isSavingItem}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuEditorPage;
