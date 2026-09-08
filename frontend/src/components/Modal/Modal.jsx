import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

/**
 * Accessible Modal Dialog Component with backdrop blur, keyboard ESC handling,
 * and header/body/footer action slots.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Close callback
 * @param {string} [props.title] - Modal title
 * @param {string} [props.size='md'] - 'sm' | 'md' | 'lg' | 'xl'
 * @param {React.ReactNode} props.children - Modal body
 * @param {React.ReactNode} [props.footer] - Modal action buttons
 */
export function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  footer,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="tapid-modal-backdrop" onClick={onClose}>
      <div
        className={`tapid-modal tapid-modal--${size}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <div className="tapid-modal__header">
            <h3 className="tapid-modal__title">{title}</h3>
            <button
              className="tapid-modal__close-btn"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="tapid-modal__body">{children}</div>

        {footer && <div className="tapid-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
