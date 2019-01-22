import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

export const HxDetailModal = ({isOpen,onClose}) => {
    return (
        <div>
            <Modal isOpen={isOpen} toggle={onClose} className="modal-dialog-centered">
                <ModalHeader toggle={onClose}>Hx detail</ModalHeader>
                <ModalBody>

                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={onClose}>Close</Button>
                </ModalFooter>
            </Modal>
      </div>

    );
}
