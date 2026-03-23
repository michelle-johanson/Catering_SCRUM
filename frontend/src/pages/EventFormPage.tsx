import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createEvent, fetchEventById, updateEvent } from '../api/eventService';
import { getAuthUserId } from '../api/loginService';

interface EventFormData {
  name: string;
  date: string;
  guestCount: string;
  budget: string;
}

interface FormErrors {
  name?: string;
  date?: string;
  guestCount?: string;
  budget?: string;
  submit?: string;
}

function EventFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = id !== undefined;

  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    date: '',
    guestCount: '',
    budget: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    if (!isEditMode) return;

    const loadEvent = async () => {
      try {
        const event = await fetchEventById(id);
        // Convert ISO date string to YYYY-MM-DD for the date input
        const dateValue = event.date ? event.date.split('T')[0] : '';
        setFormData({
          name: event.name,
          date: dateValue,
          guestCount: String(event.guestCount),
          budget: String(event.budget),
        });
      } catch {
        setErrors({ submit: 'Failed to load event. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    };

    void loadEvent();
  }, [id, isEditMode]);

  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {};
    const guestCount = Number(formData.guestCount);
    const budget = Number(formData.budget);

    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required';
    }
    if (!formData.date) {
      nextErrors.date = 'Date is required';
    }
    if (!formData.guestCount) {
      nextErrors.guestCount = 'Guest count is required';
    } else if (!Number.isInteger(guestCount) || guestCount <= 0) {
      nextErrors.guestCount = 'Guest count must be a positive whole number';
    }
    if (!formData.budget) {
      nextErrors.budget = 'Budget is required';
    } else if (!Number.isFinite(budget) || budget < 0) {
      nextErrors.budget = 'Budget must be a valid non-negative number';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    const userId = getAuthUserId();
    if (userId === null) {
      setErrors({ submit: 'Your session is missing a user ID. Please sign in again.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const isoDate = new Date(formData.date).toISOString();

      if (isEditMode) {
        await updateEvent(id, {
          id: Number(id),
          name: formData.name.trim(),
          date: isoDate,
          guestCount: Number(formData.guestCount),
          budget: Number(formData.budget),
          createdByUserId: userId,
        });
        navigate(`/events/${id}`);
      } else {
        await createEvent({
          name: formData.name.trim(),
          date: isoDate,
          guestCount: Number(formData.guestCount),
          budget: Number(formData.budget),
          createdByUserId: userId,
        });
        navigate('/events');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save event.';
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(isEditMode ? `/events/${id}` : '/events');
  };

  if (isLoading) {
    return (
      <div className="alert alert-info" role="alert">
        Loading event...
      </div>
    );
  }

  return (
    <div>
      <h2 className="section-title">{isEditMode ? 'Edit Event' : 'Create Event'}</h2>

      <div className="card p-4" style={{ maxWidth: '40rem' }}>
        <form onSubmit={handleSubmit}>
          {errors.submit && (
            <div className="alert alert-danger mb-3" role="alert">
              {errors.submit}
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className={errors.name ? 'input-error' : ''}
              value={formData.name}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="mb-3">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              name="date"
              type="date"
              className={errors.date ? 'input-error' : ''}
              value={formData.date}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
            {errors.date && <span className="field-error">{errors.date}</span>}
          </div>

          <div className="mb-3">
            <label htmlFor="guestCount">Guest Count</label>
            <input
              id="guestCount"
              name="guestCount"
              type="number"
              min={1}
              step={1}
              className={errors.guestCount ? 'input-error' : ''}
              value={formData.guestCount}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
            {errors.guestCount && <span className="field-error">{errors.guestCount}</span>}
          </div>

          <div className="mb-4">
            <label htmlFor="budget">Budget</label>
            <input
              id="budget"
              name="budget"
              type="number"
              min={0}
              step="0.01"
              className={errors.budget ? 'input-error' : ''}
              value={formData.budget}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
            {errors.budget && <span className="field-error">{errors.budget}</span>}
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode ? 'Saving...' : 'Creating...'
                : isEditMode ? 'Save Changes' : 'Create Event'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventFormPage;
