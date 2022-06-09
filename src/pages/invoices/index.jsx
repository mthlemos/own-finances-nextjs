import { useState } from 'react';
import { useInvoices, useCategories, useBillingTypes, INVOICE_API_URL } from '../../utils';
import { Header, Container, Table, Loader, Divider, Button, Dropdown } from 'semantic-ui-react';
import { StatusCodes } from 'http-status-codes';
import dayjs from 'dayjs';
import NewInvoiceModal from '../../components/invoices/NewInvoiceModal';
import { toast } from 'react-semantic-toasts';

export default function Invoices() {
    // Set currMonthAndYear to be the first day of the current month
    const [currMonthAndYear, setCurrMonthAndYear] = useState(dayjs());

    function handleDateChange(e, data) {
        const { name, value } = data;
        switch (name) {
            case 'minusDate':
                setCurrMonthAndYear(currMonthAndYear.subtract(1, 'month'));
                break;
            case 'plusDate':
                setCurrMonthAndYear(currMonthAndYear.add(1, 'month'));
                break;
        }
    }

    const [dropdownFilter, setDropdownFilter] = useState({ categoryId: '', billingTypeId: '' });
    const categories = useCategories();
    const billingTypes = useBillingTypes();

    function handleDropdown(e, data) {
        const { name, value } = data;
        setDropdownFilter({
            ...dropdownFilter,
            [name]: value
        });
    }

    const invoices = useInvoices({
        fromDate: currMonthAndYear.format('YYYY-MM'),
        ...dropdownFilter
    });

    async function deleteInvoice(id) {
        const fetchResult = await fetch(`${INVOICE_API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (fetchResult.status === StatusCodes.OK) {
            toast({
                type: 'success',
                description: 'Invoice deleted successfuly!'
            });
            // Update invoice list
            invoices.mutate();
        } else {
            toast({
                type: 'error',
                description: 'There was an error deleting the invoice'
            })
        }
    }

    return (
        <Container style={{ width: '50%', margin: 'auto' }}>
            <Header as='h1'>Invoices</Header>
            <NewInvoiceModal invoiceMutate={invoices.mutate} />
            <Divider />
            <Header as='h2' textAlign='center'>{currMonthAndYear.format('MMMM YYYY')}</Header>
            <Button name='minusDate' onClick={handleDateChange}>{'<'}</Button>
            <Button name='plusDate' floated='right' onClick={handleDateChange}>{'>'}</Button>
            <Dropdown
                name='categoryId'
                placeholder='Select Category'
                fluid
                selection
                value={dropdownFilter.categoryId}
                loading={categories.isLoading}
                options={categories.data.map(c => {
                    return {
                        key: c.id,
                        text: c.name,
                        value: c.id
                    }
                })}
                onChange={handleDropdown}
            />
            <Dropdown
                name='billingTypeId'
                placeholder='Select Billing Type'
                fluid
                selection
                value={dropdownFilter.billingTypeId}
                loading={billingTypes.isLoading}
                options={billingTypes.data.map(c => {
                    return {
                        key: c.id,
                        text: c.name,
                        value: c.id
                    }
                })}
                onChange={handleDropdown}
            />
            {(invoices.isLoading || invoices.isError) ?
                <Loader inline active /> :
                <Table
                    compact
                    padded
                >
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Name</Table.HeaderCell>
                            <Table.HeaderCell>Category</Table.HeaderCell>
                            <Table.HeaderCell>Billing Type</Table.HeaderCell>
                            <Table.HeaderCell>Purchase Date</Table.HeaderCell>
                            <Table.HeaderCell>Price</Table.HeaderCell>
                            <Table.HeaderCell>Installment</Table.HeaderCell>
                            <Table.HeaderCell>Delete</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {invoices.data.map(invoice => {
                            const { category, billingType } = invoice;
                            return (
                                <Table.Row
                                    key={invoice.id}
                                >
                                    <Table.Cell>{invoice.name}</Table.Cell>
                                    <Table.Cell>{category.name}</Table.Cell>
                                    <Table.Cell>{billingType.name}</Table.Cell>
                                    <Table.Cell>{dayjs(invoice.purchaseDate).format('DD/MM/YYYY')}</Table.Cell>
                                    <Table.Cell>{parseFloat(invoice.price).toFixed(2)}</Table.Cell>
                                    <Table.Cell>{invoice.installments == 0 ? 'N.A.' :
                                        `${currMonthAndYear.endOf('month').diff(dayjs(invoice.purchaseDate), 'month') + 1}/${invoice.installments}`
                                    }</Table.Cell>
                                    <Table.Cell>
                                        <Button icon='trash alternate' color='red' onClick={() => deleteInvoice(invoice.id)} />
                                    </Table.Cell>
                                </Table.Row>
                            )
                        })}
                    </Table.Body>
                </Table>}
        </Container>
    );
}