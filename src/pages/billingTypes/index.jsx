import { Header, Button, Container, Divider, Loader, Table } from 'semantic-ui-react';
import { toast } from 'react-semantic-toasts';
import { StatusCodes } from 'http-status-codes';
import { useBillingTypes, BILLING_TYPE_API_URL } from '../../utils';
import { mutate } from 'swr';
import NewBillingTypeModal from './components/NewBillingTypeModal';

export default function BillingTypes() {
    const billingTypes = useBillingTypes();

    async function deleteBillingType(id) {
        const fetchResult = await fetch(`${BILLING_TYPE_API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (fetchResult.status === StatusCodes.OK) {
            toast({
                type: 'success',
                description: 'Billing type deleted successfuly!'
            });
            // Update billing type list
            mutate(BILLING_TYPE_API_URL);
        } else {
            toast({
                type: 'error',
                description: 'There was an error deleting the billing type'
            })
        }
    }

    return (
        <Container style={{ width: '50%', margin: 'auto' }}>
            <Header as='h1'>Billing types</Header>
            <NewBillingTypeModal />
            <Divider />
            {(billingTypes.isLoading || billingTypes.isError) ?
                <Loader inline active /> :
                <Table
                    compact
                    padded
                >
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Name</Table.HeaderCell>
                            <Table.HeaderCell>Delete</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {billingTypes.data.map(billingType => {
                            return (
                                <Table.Row
                                    key={billingType.id}
                                >
                                    <Table.Cell>{billingType.name}</Table.Cell>
                                    <Table.Cell
                                        width='3'
                                    >
                                        <Button icon='trash alternate' color='red' onClick={() => deleteBillingType(billingType.id)} />
                                    </Table.Cell>
                                </Table.Row>
                            )
                        })}
                    </Table.Body>
                </Table>}
        </Container>
    );
}