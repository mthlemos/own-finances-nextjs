import { useInvoices, INVOICE_API_URL } from '../../utils';
import { Header, Container, Table, Loader, Divider, Button } from 'semantic-ui-react';
import { StatusCodes } from 'http-status-codes';
import { mutate } from 'swr';
import dayjs from 'dayjs';
import NewInvoiceModal from '../../components/invoices/NewInvoiceModal';
import { toast } from 'react-semantic-toasts';

export default function Invoices() {

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
            mutate(INVOICE_API_URL);
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
            <NewInvoiceModal />
            <Divider />
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