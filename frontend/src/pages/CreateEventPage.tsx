import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../api/eventService';
import { getAuthUserId } from '../api/loginService';

interface CreateEventFormData {
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

function CreateEventPage() {
	const navigate = useNavigate();

	const [formData, setFormData] = useState<CreateEventFormData>({
		name: '',
		date: '',
		guestCount: '',
		budget: '',
	});
	const [errors, setErrors] = useState<FormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

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

		if (!validateForm()) {
			return;
		}

		const userId = getAuthUserId();
		if (userId === null) {
			setErrors({ submit: 'Your session is missing a user ID. Please sign in again.' });
			return;
		}

		setIsSubmitting(true);

		try {
			await createEvent({
				name: formData.name.trim(),
				date: new Date(formData.date).toISOString(),
				guestCount: Number(formData.guestCount),
				budget: Number(formData.budget),
				createdByUserId: userId,
			});

			navigate('/');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to create event.';
			setErrors({ submit: message });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div>
			<h2 className="section-title">Create Event</h2>

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
							{isSubmitting ? 'Creating...' : 'Create Event'}
						</button>
						<button
							type="button"
							className="btn btn-secondary"
							onClick={() => navigate('/')}
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

export default CreateEventPage;
