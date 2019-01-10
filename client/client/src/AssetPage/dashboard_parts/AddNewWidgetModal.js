import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

export const AddNewWidgetModal = ({isOpen,onClose}) => {
    return (
        <div>
            <Modal isOpen={isOpen} toggle={onClose} >
                <ModalHeader toggle={onClose} >Add New Widget</ModalHeader>
                <ModalBody>
                    <p>modal body</p>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" >Add</Button>{' '}
                    <Button color="secondary" >Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>

    );
}