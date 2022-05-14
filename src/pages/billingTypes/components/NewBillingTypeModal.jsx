import { useState } from 'react';
import { Header, Form, Button, Modal } from 'semantic-ui-react';
import { toast, SemanticToastContainer } from 'react-semantic-toasts';
import { StatusCodes } from 'http-status-codes';
import { BILLING_TYPE_API_URL } from '../../../utils';
import { mutate } from 'swr';

export default function NewBillingTypeModal() {
    const initialState = {
        name: ''
    };
    const [formFields, setFormFields] = useState({
        ...initialState
    });
    // This object will be populated with
    // required missing fields
    const [formErrors, setFormErrors] = useState({});

    // State for controlling modal open or not
    const [open, setOpen] = useState(false);

    function handleOnChange(e, data) {
        const { name, value } = data;
        setFormFields({
            ...formFields,
            [name]: value
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        // Clear field errors
        setFormErrors({});
        // Temp formErrors
        const tempFormErrors = {};
        const requiredFields = ['name'];
        // Check for missing required fields
        requiredFields.forEach(field => {
            if (!formFields[field]) {
                tempFormErrors[field] = true;
            }
        });
        // Set form errors
        setFormErrors({
            ...tempFormErrors
        });
        // If there were form errors, abort submit
        if (Object.keys(tempFormErrors).length) {
            toast({
                type: 'error',
                description: 'Please fill all of the required fields!'
            });
            return;
        }
        const dataTobeSent = {
            ...formFields
        };

        const fetchResult = await fetch(BILLING_TYPE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataTobeSent)
        });

        if (fetchResult.status === StatusCodes.OK) {
            toast({
                type: 'success',
                description: 'Billing type created successfuly!'
            });
            // Clear fields
            setFormFields({
                ...initialState
            });
            // Update billing types
            mutate(BILLING_TYPE_API_URL);
            // Close modal
            setOpen(false);
        } else {
            toast({
                type: 'error',
                description: 'There was an error creating the billing type'
            });
        }
    }

    return (
        <Modal
            closeIcon
            open={open}
            trigger={<Button>New Billing Type</Button>}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
        >
            <Header>Create a new billing type</Header>
            <Modal.Content>
                <SemanticToastContainer />
                <Form onSubmit={handleSubmit}>
                    <Form.Field required error={formErrors.name}>
                        <label>Billing type name</label>
                        <Form.Input name='name' placeholder='Invoice name' value={formFields.name} onChange={handleOnChange} />
                    </Form.Field>
                    <Form.Button type='submit'>Submit</Form.Button>
                </Form>
            </Modal.Content>
        </Modal>
    );
}