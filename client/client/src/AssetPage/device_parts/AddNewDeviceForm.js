import React from 'react';
import PropTypes from 'prop-types';
import TextInput from '../../_components/TextInput'

const AddNewDeviceForm = ({device,onChange,errors}) => {
    return (
        <form>
            <TextInput 
                name="DisplayName"
                label="Name"
                placeholder="(required)"
                value={device.DisplayName}
                onChange={onChange}
                error={errors.DisplayName} />
            <TextInput 
                name="SerialNumber"
                label="Serial Number"
                placeholder="(optional)"
                value={device.SerialNumber}
                onChange={onChange}
                error={errors.SerialNumber} />
        </form>
    );
};

AddNewDeviceForm.propTypes = {
    device: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    errors: PropTypes.object
  };

export default AddNewDeviceForm;