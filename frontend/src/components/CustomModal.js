// src/components/CustomModal.jsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const CustomModal = ({
  show,
  onConfirm,
  onCancel,
  title,
  body,
  confirmText = 'OK',
  cancelText = 'Cancel',
}) => {
  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      backdrop="static"
      contentClassName="custom-modal-content"
    >
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="w-100 text-center fw-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#212529' }}>
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center px-4 py-3" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', color: '#495057' }}>
        {body}
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-center gap-3 border-0 pb-4">
        <Button
          variant="outline-secondary"
          onClick={onCancel}
          style={{
            fontFamily: 'Outfit, sans-serif',
            padding: '6px 20px',
            borderRadius: '8px',
            fontWeight: '500',
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          style={{
            fontFamily: 'Outfit, sans-serif',
            backgroundColor: '#d90429',
            border: 'none',
            padding: '6px 20px',
            borderRadius: '8px',
            fontWeight: '500',
          }}
        >
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CustomModal;
