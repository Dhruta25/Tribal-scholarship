import React, { useEffect, useRef } from 'react';
import { Modal } from 'react-bootstrap';
import Button from './Button';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

const ConfirmationDialog = ({
  show,
  onHide,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary', // primary | destructive | accent
  loading = false
}) => {
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (show && confirmBtnRef.current) {
      confirmBtnRef.current.focus();
    }
  }, [show]);

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" keyboard={!loading}>
      <Modal.Header closeButton={!loading} className="border-bottom pb-3">
        <Modal.Title className="h6 fw-bold mb-0 d-flex align-items-center gap-2">
          {variant === 'destructive' ? (
            <AlertTriangle className="text-danger" size={20} />
          ) : (
            <Info className="text-primary" size={20} />
          )}
          <span>{title}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-4">
        <p className="text-secondary mb-0" style={{ lineHeight: '1.6' }}>
          {message}
        </p>
      </Modal.Body>
      <Modal.Footer className="border-top pt-3 d-flex justify-content-end gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onHide}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          ref={confirmBtnRef}
          variant={variant === 'destructive' ? 'destructive-solid' : 'primary'}
          size="sm"
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationDialog;
