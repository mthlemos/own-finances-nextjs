import { Header, Button, Container, Divider, Loader, Table } from 'semantic-ui-react';
import { toast } from 'react-semantic-toasts';
import { StatusCodes } from 'http-status-codes';
import { useCategories, CATEGORY_API_URL } from '../../utils';
import { mutate } from 'swr';
import NewCategoryModal from './components/NewCategoryModal';

export default function newCategory() {
    const categories = useCategories();

    async function deleteCategory(id) {
        const fetchResult = await fetch(`${CATEGORY_API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (fetchResult.status === StatusCodes.OK) {
            toast({
                type: 'success',
                description: 'Category deleted successfuly!'
            });
            // Update category list
            mutate(CATEGORY_API_URL);
        } else {
            toast({
                type: 'error',
                description: 'There was an error deleting the category'
            })
        }
    }

    return (
        <Container style={{ width: '50%', margin: 'auto' }}>
            <Header as='h1'>Categories</Header>
            <NewCategoryModal />
            <Divider />
            {(categories.isLoading || categories.isError) ?
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
                        {categories.data.map(category => {
                            return (
                                <Table.Row
                                    key={category.id}
                                >
                                    <Table.Cell>{category.name}</Table.Cell>
                                    <Table.Cell
                                        width='3'
                                    >
                                        <Button icon='trash alternate' color='red' onClick={() => deleteCategory(category.id)} />
                                    </Table.Cell>
                                </Table.Row>
                            )
                        })}
                    </Table.Body>
                </Table>}
        </Container>
    );
}