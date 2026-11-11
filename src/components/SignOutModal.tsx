import { LogOut } from 'lucide-react'

interface SignOutModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function SignOutModal({ isOpen, onClose, onConfirm }: SignOutModalProps) {
  if (!isOpen) return null

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(0, 0, 0, 0.42)',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signout-title"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#fff',
          border: '1px solid var(--cream-secondary)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.18)',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5eadb',
            color: '#a47a49',
            marginBottom: '16px',
          }}
        >
          <LogOut size={20} />
        </div>

        <h3 id="signout-title" style={{ margin: '0 0 8px' }}>
          Sign out?
        </h3>
        <p
          style={{
            margin: '0',
            color: 'var(--text-muted)',
            fontSize: '14px',
            lineHeight: 1.6,
          }}
        >
          Are you sure you want to sign out of your student portal?
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '24px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            className="btn-outline"
            onClick={onClose}
          >
            No
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onConfirm}
          >
            Yes, Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignOutModal
