interface Props {
  open: boolean;
  itemName: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function ConfirmDeleteModal({ open, itemName, isDeleting, onClose, onConfirm }: Props) {
  if (!open) return null;

  return (
    <div className="app-modal-overlay" onClick={onClose}>
      <div className="app-modal" onClick={e => e.stopPropagation()}>
        <div className="app-modal-header">
          <p className="app-modal-title">Delete {itemName}?</p>
        </div>
        <div className="app-modal-body">
          <p>This action is permanent and cannot be undone.</p>
        </div>
        <div className="app-modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Yes, delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
