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

const STEP_LABELS = ['Event Details', 'Guests & Menu', 'Analytics'];

function CreateEventModal({ open, onClose, onSuccess, editingEvent }: Props) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);

  // Step 1
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [budget, setBudget] = useState('');

  // Step 2
  const [guestCount, setGuestCount] = useState('');
  const [selectedMenuId, setSelectedMenuId] = useState('');

  // Step 3
  const [totalSales, setTotalSales] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [foodWasteLbs, setFoodWasteLbs] = useState('');

  // Pre-fill on edit / reset on create
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setError(null);
    if (editingEvent) {
      setName(editingEvent.name);
      // Convert ISO date to YYYY-MM-DD for the date input
      setDate(editingEvent.date ? editingEvent.date.slice(0, 10) : '');
      setClientName(editingEvent.clientName ?? '');
      setClientContact(editingEvent.clientContact ?? '');
      setBudget(editingEvent.budget.toString());
      setGuestCount(editingEvent.guestCount.toString());
      setSelectedMenuId(editingEvent.menus?.[0]?.id?.toString() ?? '');
      setTotalSales(editingEvent.totalSales?.toString() ?? '');
      setTotalCost(editingEvent.totalCost?.toString() ?? '');
      setFoodWasteLbs(editingEvent.foodWasteLbs?.toString() ?? '');
    } else {
      setName('');
      setDate('');
      setClientName('');
      setClientContact('');
      setBudget('');
      setGuestCount('');
      setSelectedMenuId('');
      setTotalSales('');
      setTotalCost('');
      setFoodWasteLbs('');
    }
  }, [open, editingEvent]);

  // Load menus on open
  useEffect(() => {
    if (!open) return;
    fetchMenus().then(setMenus).catch(() => setMenus([]));
  }, [open]);

  if (!open) return null;

  const handleStep1Next = () => {
    if (!name.trim()) { setError('Event name is required.'); return; }
    if (!date) { setError('Date is required.'); return; }
    if (budget === '' || isNaN(Number(budget)) || Number(budget) < 0) {
      setError('A valid budget (0 or more) is required.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleStep2Next = () => {
    const gc = Number(guestCount);
    if (!guestCount || isNaN(gc) || gc < 1 || !Number.isInteger(gc)) {
      setError('Guest count must be a whole number of at least 1.');
      return;
    }
    setError(null);
    setStep(3);
  };

  const handleSubmit = async (skipAnalytics = false) => {
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
        totalSales: !skipAnalytics && totalSales !== '' ? Number(totalSales) : undefined,
        totalCost: !skipAnalytics && totalCost !== '' ? Number(totalCost) : undefined,
        foodWasteLbs: !skipAnalytics && foodWasteLbs !== '' ? Number(foodWasteLbs) : undefined,
        createdByUserId: userId,
        companyId,
      };

      let savedEvent: Event;
      if (editingEvent) {
        await updateEvent(editingEvent.id, { ...payload, id: editingEvent.id });
        // Re-fetch to get updated menus
        savedEvent = { ...editingEvent, ...payload };
      } else {
        savedEvent = await createEvent(payload);
      }

      // Handle menu assignment
      if (selectedMenuId) {
        const menuId = Number(selectedMenuId);
        const alreadyAssigned = editingEvent?.menus?.some(m => m.id === menuId);
        if (!alreadyAssigned) {
          await assignMenuToEvent(menuId, savedEvent.id);
        }
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
  const title = isEditMode ? 'Edit Event' : 'Create Event';

  return (
    <div className="app-modal-overlay" onClick={onClose}>
      <div className="app-modal app-modal-wide" onClick={e => e.stopPropagation()}>

        {/* Step indicator */}
        <div className="app-modal-header" style={{ borderBottom: 'var(--border)', paddingBottom: 'var(--space-4)' }}>
          <p className="app-modal-title" style={{ marginBottom: 'var(--space-4)' }}>{title}</p>
          <div className="wizard-steps" style={{ padding: 0, borderBottom: 'none', justifyContent: 'flex-start', gap: 'var(--space-8)' }}>
            {STEP_LABELS.map((label, i) => (
              <div
                key={label}
                className={`wizard-step-dot${step === i + 1 ? ' active' : step > i + 1 ? ' done' : ''}`}
              >
                <span className="wizard-step-num">{step > i + 1 ? '✓' : i + 1}</span>
                <span className="wizard-step-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sliding panels */}
        <div className="wizard-track-container app-modal-body" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="wizard-track" style={{ transform: `translateX(-${(step - 1) * 100}%)` }}>

            {/* ── Step 1: Event Details ── */}
            <div className="wizard-panel" style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="settings-field" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="ev-name">Event Name *</label>
                  <input id="ev-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Smith Wedding" disabled={isLoading} />
                </div>
                <div className="settings-field">
                  <label htmlFor="ev-date">Date *</label>
                  <input id="ev-date" type="date" value={date} onChange={e => setDate(e.target.value)} disabled={isLoading} />
                </div>
                <div className="settings-field">
                  <label htmlFor="ev-budget">Budget ($) *</label>
                  <input id="ev-budget" type="number" min="0" step="0.01" value={budget} onChange={e => setBudget(e.target.value)} placeholder="0.00" disabled={isLoading} />
                </div>
                <div className="settings-field">
                  <label htmlFor="ev-client-name">Client Name</label>
                  <input id="ev-client-name" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Jane Smith" disabled={isLoading} />
                </div>
                <div className="settings-field">
                  <label htmlFor="ev-client-contact">Client Contact</label>
                  <input id="ev-client-contact" value={clientContact} onChange={e => setClientContact(e.target.value)} placeholder="Phone or email" disabled={isLoading} />
                </div>
              </div>
            </div>

            {/* ── Step 2: Guests & Menu ── */}
            <div className="wizard-panel" style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="settings-field">
                  <label htmlFor="ev-guests">Guest Count *</label>
                  <input id="ev-guests" type="number" min="1" step="1" value={guestCount} onChange={e => setGuestCount(e.target.value)} placeholder="e.g. 150" disabled={isLoading} />
                </div>
                <div className="settings-field">
                  <label htmlFor="ev-menu">Assign Menu</label>
                  <select id="ev-menu" value={selectedMenuId} onChange={e => setSelectedMenuId(e.target.value)} disabled={isLoading}>
                    <option value="">No menu</option>
                    {menus.map(m => (
                      <option key={m.id} value={m.id.toString()}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Step 3: Post-Event Analytics ── */}
            <div className="wizard-panel" style={{ padding: 'var(--space-6)' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                These fields are optional and can be filled in after the event has taken place.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="settings-field">
                  <label htmlFor="ev-sales">Total Sales ($)</label>
                  <input id="ev-sales" type="number" min="0" step="0.01" value={totalSales} onChange={e => setTotalSales(e.target.value)} placeholder="0.00" disabled={isLoading} />
                </div>
                <div className="settings-field">
                  <label htmlFor="ev-cost">Total Cost ($)</label>
                  <input id="ev-cost" type="number" min="0" step="0.01" value={totalCost} onChange={e => setTotalCost(e.target.value)} placeholder="0.00" disabled={isLoading} />
                </div>
                <div className="settings-field">
                  <label htmlFor="ev-waste">Food Waste (lbs)</label>
                  <input id="ev-waste" type="number" min="0" step="0.1" value={foodWasteLbs} onChange={e => setFoodWasteLbs(e.target.value)} placeholder="0.0" disabled={isLoading} />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '0 var(--space-6)', marginBottom: 'var(--space-2)' }}>
            <span className="settings-save-error">{error}</span>
          </div>
        )}

        {/* Footer */}
        <div className="app-modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            {step > 1 && (
              <button type="button" className="btn btn-secondary" onClick={() => { setError(null); setStep(s => s - 1); }} disabled={isLoading}>
                ← Back
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            {step === 3 && (
              <button type="button" className="btn btn-outline" onClick={() => void handleSubmit(true)} disabled={isLoading}>
                Skip & Save
              </button>
            )}
            {step < 3 && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={step === 1 ? handleStep1Next : handleStep2Next}
                disabled={isLoading}
              >
                Next →
              </button>
            )}
            {step === 3 && (
              <button type="button" className="btn btn-primary" onClick={() => void handleSubmit(false)} disabled={isLoading}>
                {isLoading ? 'Saving…' : 'Save Event'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default CreateEventModal;
