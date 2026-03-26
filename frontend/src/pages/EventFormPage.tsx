import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createEvent, fetchEventById, updateEvent } from '../api/eventService';
import { getAuthUserId, getAuthCompanyId } from '../api/loginService';

interface EventFormData {
  name: string;
  date: string;
  guestCount: string;
  budget: string;
  foodWasteLbs: string;
  totalCost: string;
  totalSales: string;
}

interface FormErrors {
  name?: string;
  date?: string;
  guestCount?: string;
  budget?: string;
  foodWasteLbs?: string;
  totalCost?: string;
  totalSales?: string;
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
    foodWasteLbs: '',
    totalCost: '',
    totalSales: '',
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
          foodWasteLbs:
            event.foodWasteLbs != null ? String(event.foodWasteLbs) : '',
          totalCost: event.totalCost != null ? String(event.totalCost) : '',
          totalSales: event.totalSales != null ? String(event.totalSales) : '',
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

    if (
      formData.foodWasteLbs &&
      (isNaN(Number(formData.foodWasteLbs)) ||
        Number(formData.foodWasteLbs) < 0)
    ) {
      nextErrors.foodWasteLbs = 'Food waste must be a non-negative number';
    }
    if (
      formData.totalCost &&
      (isNaN(Number(formData.totalCost)) || Number(formData.totalCost) < 0)
    ) {
      nextErrors.totalCost = 'Total cost must be a non-negative number';
    }
    if (
      formData.totalSales &&
      (isNaN(Number(formData.totalSales)) || Number(formData.totalSales) < 0)
    ) {
      nextErrors.totalSales = 'Total sales must be a non-negative number';
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
    const companyId = getAuthCompanyId();
    if (userId === null || companyId === null) {
      setErrors({
        submit: 'Your session is missing required info. Please sign in again.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const isoDate = new Date(formData.date).toISOString();

      const optionalFields = {
        foodWasteLbs: formData.foodWasteLbs
          ? Number(formData.foodWasteLbs)
          : undefined,
        totalCost: formData.totalCost ? Number(formData.totalCost) : undefined,
        totalSales: formData.totalSales
          ? Number(formData.totalSales)
          : undefined,
      };

      if (isEditMode) {
        await updateEvent(id, {
          id: Number(id),
          name: formData.name.trim(),
          date: isoDate,
          guestCount: Number(formData.guestCount),
          budget: Number(formData.budget),
          ...optionalFields,
          createdByUserId: userId,
          companyId,
        });
        navigate(`/events/${id}`);
      } else {
        await createEvent({
          name: formData.name.trim(),
          date: isoDate,
          guestCount: Number(formData.guestCount),
          budget: Number(formData.budget),
          ...optionalFields,
          createdByUserId: userId,
          companyId,
        });
        navigate('/events');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to save event.';
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
      <h2 className="section-title">
        {isEditMode ? 'Edit Event' : 'Create Event'}
      </h2>

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
            {errors.guestCount && (
              <span className="field-error">{errors.guestCount}</span>
            )}
          </div>

          <div className="mb-3">
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
            {errors.budget && (
              <span className="field-error">{errors.budget}</span>
            )}
          </div>

          <hr className="my-3" />
          <p className="text-muted mb-3" style={{ fontSize: 'var(--text-sm)' }}>
            Post-event financials (optional — fill in after the event)
          </p>

          <div className="mb-3">
            <label htmlFor="totalSales">Total Sales ($)</label>
            <input
              id="totalSales"
              name="totalSales"
              type="number"
              min={0}
              step="0.01"
              placeholder="e.g. 5000.00"
              className={errors.totalSales ? 'input-error' : ''}
              value={formData.totalSales}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
            {errors.totalSales && (
              <span className="field-error">{errors.totalSales}</span>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="totalCost">Total Cost ($)</label>
            <input
              id="totalCost"
              name="totalCost"
              type="number"
              min={0}
              step="0.01"
              placeholder="e.g. 3200.00"
              className={errors.totalCost ? 'input-error' : ''}
              value={formData.totalCost}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
            {errors.totalCost && (
              <span className="field-error">{errors.totalCost}</span>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="foodWasteLbs">Food Waste (lbs)</label>
            <input
              id="foodWasteLbs"
              name="foodWasteLbs"
              type="number"
              min={0}
              step="0.1"
              placeholder="e.g. 12.5"
              className={errors.foodWasteLbs ? 'input-error' : ''}
              value={formData.foodWasteLbs}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
            {errors.foodWasteLbs && (
              <span className="field-error">{errors.foodWasteLbs}</span>
            )}
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditMode
                  ? 'Saving...'
                  : 'Creating...'
                : isEditMode
                  ? 'Save Changes'
                  : 'Create Event'}
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
