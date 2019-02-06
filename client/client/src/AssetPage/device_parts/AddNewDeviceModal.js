import React from 'react';
import AddNewDeviceForm from './AddNewDeviceForm';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

export const AddNewDeviceModal = ({device,onChange,errors,onAdd,isOpen,onClose}) => {
    return (
        <div>
            <Modal isOpen={isOpen} toggle={onClose} className="modal-dialog-centered">
                <ModalHeader toggle={onClose}>Add New Device</ModalHeader>
                <ModalBody>
                    <AddNewDeviceForm
                        device={device}
                        onChange={onChange}
                        errors={errors}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={onAdd}>Add</Button>{' '}
                    <Button color="secondary" onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </Modal>
      </div>

    );
}
