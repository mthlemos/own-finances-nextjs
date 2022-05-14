import { useState } from 'react';
import { useBillingTypes, useCategories, INVOICE_API_URL } from '../../../utils';
import { Header, Form, Dropdown, Checkbox, Modal, Button } from 'semantic-ui-react';
import { toast, SemanticToastContainer } from 'react-semantic-toasts';
import dayjs from 'dayjs';
import { StatusCodes } from 'http-status-codes';
import { mutate } from 'swr';

export default function NewInvoiceModal() {
    const initialState = {
        name: '',
        purchaseDateField: '',
        purchaseDate: '',
        billingTypeId: '',
        categoryId: '',
        installments: 0,
        price: 0.00,
        recurring: false
    };
    const [formFields, setFormFields] = useState({
        ...initialState
    });
    // This object will be populated with
    // required missing fields
    const [formErrors, setFormErrors] = useState({});

    // State for controlling modal open or not
    const [open, setOpen] = useState(false);

    const billingTypes = useBillingTypes();
    const categories = useCategories();

    function handleOnChange(e, data) {
        const { name, value, checked } = data;
        if (name) {
            switch (name) {
                case 'purchaseDateField':
                    // If the field is purchaseDateField
                    // We have to parse it into YYYY-MM-DD format
                    // In order to send to the backend
                    // And also update de purchaseDateField value
                    // Parse the date
                    const purchaseDateObj = dayjs(value);
                    setFormFields({
                        ...formFields,
                        [name]: value,
                        purchaseDate: purchaseDateObj.format('YYYY-MM-DD')
                    });
                    break;
                case 'recurring':
                    // Recurring field is a checkbox
                    // For checkboxes, the value is stored on
                    // the checked field
                    setFormFields({
                        ...formFields,
                        [name]: checked
                    });
                    break;
                default:
                    setFormFields({
                        ...formFields,
                        [name]: value
                    });
            }
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        // Clear field errors
        setFormErrors({});
        // Temp formErrors
        const tempFormErrors = {};
        const requiredFields = ['name', 'categoryId', 'billingTypeId', 'purchaseDateField', 'price'];
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
        // Erase temp purchaseDateField field
        delete dataTobeSent.purchaseDateField;

        const fetchResult = await fetch(INVOICE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataTobeSent)
        });

        if (fetchResult.status === StatusCodes.OK) {
            toast({
                type: 'success',
                description: 'Invoice created successfuly!'
            });
            // Clear fields
            setFormFields({
                ...initialState
            });
            // Update invoices
            mutate(INVOICE_API_URL);
            // Close modal
            setOpen(false);
        } else {
            toast({
                type: 'error',
                description: 'There was an error creating the invoice'
            });
        }
    }

    return (
        <Modal
            closeIcon
            open={open}
            trigger={<Button>New Invoice</Button>}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
        >
            <Header>Create a new invoice</Header>
            <Modal.Content>
                <SemanticToastContainer />
                <Form onSubmit={handleSubmit}>
                    <Form.Field required error={formErrors.name}>
                        <label>Invoice name</label>
                        <Form.Input name='name' placeholder='Invoice name' value={formFields.name} onChange={handleOnChange} />
                    </Form.Field>
                    <Form.Group widths='equal'>
                        <Form.Field required error={formErrors.categoryId}>
                            <label>Category</label>
                            <Dropdown
                                name='categoryId'
                                placeholder='Select Category'
                                fluid
                                selection
                                value={formFields.categoryId}
                                loading={categories.isLoading}
                                options={categories.data.map(c => {
                                    return {
                                        key: c.id,
                                        text: c.name,
                                        value: c.id
                                    }
                                })}
                                onChange={handleOnChange}
                            />
                        </Form.Field>
                        <Form.Field required error={formErrors.billingTypeId}>
                            <label>Billing Type</label>
                            <Dropdown
                                name='billingTypeId'
                                placeholder='Select Billing Type'
                                fluid
                                selection
                                value={formFields.billingTypeId}
                                loading={billingTypes.isLoading}
                                options={billingTypes.data.map(bt => {
                                    return {
                                        key: bt.id,
                                        text: bt.name,
                                        value: bt.id
                                    }
                                })}
                                onChange={handleOnChange}
                            />
                        </Form.Field>
                    </Form.Group>
                    <Form.Field required error={formErrors.purchaseDateField}>
                        <label>Purchase Date</label>
                        <Form.Input name='purchaseDateField' type='date' value={formFields.purchaseDateField} onChange={handleOnChange} style={{ minHeight: '2.5rem' }} />
                    </Form.Field>
                    <Form.Field required error={formErrors.price}>
                        <label>Price</label>
                        <Form.Input name='price' type='number' value={formFields.price} onChange={handleOnChange} />
                    </Form.Field>
                    <Form.Field>
                        <label>Installments</label>
                        <Form.Input name='installments' placeholder='Installments' value={formFields.installments} type='number' disabled={formFields.recurring} onChange={handleOnChange} />
                    </Form.Field>
                    <Form.Field>
                        <Checkbox name='recurring' toggle label='Recurring' checked={formFields.recurring} onChange={handleOnChange} />
                    </Form.Field>
                    <Form.Button type='submit'>Submit</Form.Button>
                </Form>
            </Modal.Content>
        </Modal>
    );
}