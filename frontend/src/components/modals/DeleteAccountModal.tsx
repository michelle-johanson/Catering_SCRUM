type DeleteModal =
  | { open: false }
  | { open: true; canDelete: false; blockReason: string }
  | { open: true; canDelete: true; companyWillBeDeleted: boolean; companyName: string | null };

interface Props {
  modal: DeleteModal;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteAccountModal({ modal, isDeleting, onClose, onConfirm }: Props) {
  if (!modal.open) return null;

  return (
    <div className="app-modal-overlay" onClick={onClose}>
      <div className="app-modal" onClick={e => e.stopPropagation()}>
        {!modal.canDelete ? (
          <>
            <div className="app-modal-header">
              <p className="app-modal-title">Cannot delete account</p>
            </div>
            <div className="app-modal-body">
              <p className="app-modal-block">{modal.blockReason}</p>
            </div>
            <div className="app-modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="app-modal-header">
              <p className="app-modal-title">Delete your account?</p>
            </div>
            <div className="app-modal-body">
              <p>This action is permanent and cannot be undone.</p>
              {modal.companyWillBeDeleted && (
                <p className="app-modal-warning">
                  You are the only member of <strong>{modal.companyName}</strong>. Deleting your
                  account will also permanently delete the company and all of its events, menus,
                  and tasks.
                </p>
              )}
            </div>
            <div className="app-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button className="btn-danger" onClick={onConfirm} disabled={isDeleting}>
                {isDeleting ? 'Deleting…' : 'Yes, delete my account'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DeleteAccountModal;
export type { DeleteModal };
