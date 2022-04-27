import { useState } from 'react';
import { useBillingTypes, useCategories } from '../../utils';
import { Header, Form, Dropdown, Checkbox, Container } from 'semantic-ui-react';
import { toast } from 'react-semantic-toasts';
import dayjs from 'dayjs';
import { StatusCodes } from 'http-status-codes';

const INVOICE_API_URL = '/api/invoice'

export default function newInvoice() {
    const [formFields, setFormFields] = useState({
        name: '',
        purchaseDateField: '',
        purchaseDate: '',
        billingTypeId: '',
        categoryId: '',
        installments: 0,
        recurring: false
    });
    // This object will be populated with
    // required missing fields
    const [formErrors, setFormErrors] = useState({});

    const billingTypes = useBillingTypes();
    const categories = useCategories();

    function handleOnChange(e, data) {
        const { name, value, checked } = data;
        console.log(data);
        if (name) {
            switch (name) {
                case 'purchaseDateField':
                    // If the field is purchaseDateField
                    // We have to parse it into unix timestamp
                    // In order to send do the backend
                    // And also update de purchaseDateField value
                    // Parse the date
                    const purchaseDateObj = dayjs(value);
                    setFormFields({
                        ...formFields,
                        [name]: value,
                        purchaseDate: purchaseDateObj.valueOf()
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
        if (!formFields.name) { tempFormErrors.name = true }
        if (!formFields.categoryId) { tempFormErrors.categoryId = true }
        if (!formFields.billingTypeId) { tempFormErrors.billingTypeId = true }
        if (!formFields.purchaseDateField) { tempFormErrors.purchaseDateField = true }
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
        })

        if (fetchResult.status === StatusCodes.OK) {
            toast({
                type: 'success',
                description: 'Invoice created successfuly!'
            });
            // Clear fields
            setFormFields({
                name: '',
                purchaseDateField: '',
                purchaseDate: '',
                billingTypeId: '',
                categoryId: '',
                installments: 0,
                recurring: false
            })
        } else {
            toast({
                type: 'error',
                description: 'There was an error creating the invoice'
            });
        }
    }

    return (
        <Container style={{ width: '50%', margin: 'auto' }}>
            <Header dividing>Create a new invoice</Header>
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
                <Form.Field>
                    <label>Installments</label>
                    <Form.Input name='installments' placeholder='Installments' value={formFields.installments} type='number' disabled={formFields.recurring} onChange={handleOnChange} />
                </Form.Field>
                <Form.Field>
                    <Checkbox name='recurring' toggle label='Recurring' value={formFields.recurring} onChange={handleOnChange} />
                </Form.Field>
                <Form.Button type='submit'>Submit</Form.Button>
            </Form>
        </Container>
    );
}