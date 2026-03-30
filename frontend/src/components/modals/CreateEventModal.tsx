import { useState, useEffect } from 'react';
import type { Event } from '../../types/Event';
import type { Menu } from '../../types/Menu';
import { createEvent, updateEvent } from '../../api/eventService';
import { fetchMenus, assignMenuToEvent } from '../../api/menuService';
import { getAuthUserId, getAuthCompanyId } from '../../api/loginService';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (event: Event) => void;
  editingEvent?: Event | null;
}

function CreateEventModal({ open, onClose, onSuccess, editingEvent }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);

  // Consolidated State
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [budget, setBudget] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [selectedMenuId, setSelectedMenuId] = useState('');

  // Pre-fill on edit / reset on create
  useEffect(() => {
    if (!open) return;
    setError(null);
    if (editingEvent) {
      setName(editingEvent.name);
      setDate(editingEvent.date ? editingEvent.date.slice(0, 10) : '');
      setClientName(editingEvent.clientName ?? '');
      setClientContact(editingEvent.clientContact ?? '');
      setBudget(editingEvent.budget.toString());
      setGuestCount(editingEvent.guestCount.toString());
      // FIXED: Now reads the single assignedMenuId
      setSelectedMenuId(editingEvent.assignedMenuId?.toString() ?? '');
    } else {
      setName('');
      setDate('');
      setClientName('');
      setClientContact('');
      setBudget('');
      setGuestCount('');
      setSelectedMenuId('');
    }
  }, [open, editingEvent]);

  // Load menus on open
  useEffect(() => {
    if (!open) return;
    fetchMenus()
      .then(setMenus)
      .catch(() => setMenus([]));
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Event name is required.');
      return;
    }
    if (!date) {
      setError('Date is required.');
      return;
    }
    if (budget === '' || isNaN(Number(budget)) || Number(budget) < 0) {
      setError('A valid budget (0 or more) is required.');
      return;
    }
    const gc = Number(guestCount);
    if (!guestCount || isNaN(gc) || gc < 1 || !Number.isInteger(gc)) {
      setError('Guest count must be a whole number of at least 1.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const userId = getAuthUserId()!;
      const companyId = getAuthCompanyId()!;

      const payload = {
        name: name.trim(),
        date: new Date(date).toISOString(),
        guestCount: Number(guestCount),
        budget: Number(budget),
        clientName: clientName.trim() || undefined,
        clientContact: clientContact.trim() || undefined,
        createdByUserId: userId,
        companyId,
        // Notice: Analytics fields are gone!
      };

      let savedEvent: Event;
      if (editingEvent) {
        await updateEvent(editingEvent.id, { ...payload, id: editingEvent.id });
        savedEvent = { ...editingEvent, ...payload };
      } else {
        savedEvent = await createEvent(payload);
      }

      // Handle single menu assignment
      if (
        selectedMenuId &&
        selectedMenuId !== editingEvent?.assignedMenuId?.toString()
      ) {
        await assignMenuToEvent(Number(selectedMenuId), savedEvent.id);
        savedEvent.assignedMenuId = Number(selectedMenuId);
      }

      onSuccess(savedEvent);
      onClose();
    } catch {
      setError('Failed to save event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isEditMode = !!editingEvent;
  const title = isEditMode ? 'Edit Event Details' : 'Create New Event';

  return (
    <div className="app-modal-overlay" onClick={onClose}>
      <div
        className="app-modal app-modal-wide"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="app-modal-header"
          style={{
            borderBottom: 'var(--border)',
            paddingBottom: 'var(--space-4)',
          }}
        >
          <h3 className="app-modal-title">{title}</h3>
        </div>

        <div className="app-modal-body" style={{ padding: 'var(--space-6)' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-4)',
            }}
          >
            <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="ev-name">Event Name *</label>
              <input
                id="ev-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Smith Wedding"
                disabled={isLoading}
              />
            </div>
            <div className="settings-field">
              <label htmlFor="ev-date">Date *</label>
              <input
                id="ev-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="settings-field">
              <label htmlFor="ev-guests">Guest Count *</label>
              <input
                id="ev-guests"
                type="number"
                min="1"
                step="1"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                placeholder="e.g. 150"
                disabled={isLoading}
              />
            </div>
            <div className="settings-field">
              <label htmlFor="ev-budget">Budget ($) *</label>
              <input
                id="ev-budget"
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0.00"
                disabled={isLoading}
              />
            </div>
            <div className="settings-field">
              <label htmlFor="ev-menu">Assigned Menu</label>
              <select
                id="ev-menu"
                value={selectedMenuId}
                onChange={(e) => setSelectedMenuId(e.target.value)}
                disabled={isLoading}
              >
                <option value="">No menu</option>
                {menus.map((m) => (
                  <option key={m.id} value={m.id.toString()}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="settings-field">
              <label htmlFor="ev-client-name">Client Name</label>
              <input
                id="ev-client-name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Jane Smith"
                disabled={isLoading}
              />
            </div>
            <div className="settings-field">
              <label htmlFor="ev-client-contact">Client Contact</label>
              <input
                id="ev-client-contact"
                value={clientContact}
                onChange={(e) => setClientContact(e.target.value)}
                placeholder="Phone or email"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '0 var(--space-6)',
              marginBottom: 'var(--space-2)',
            }}
          >
            <span className="settings-save-error" style={{ color: 'red' }}>
              {error}
            </span>
          </div>
        )}

        <div
          className="app-modal-footer"
          style={{ justifyContent: 'flex-end', gap: 'var(--space-3)' }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void handleSubmit()}
            disabled={isLoading}
          >
            {isLoading ? 'Saving…' : 'Save Event'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateEventModal;
