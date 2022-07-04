import { Loader, Table } from "semantic-ui-react";

export default function DynamicTable({ columns, data, isLoading, isError } = {}) {
    if (!Array.isArray(columns)) {
        throw new Error("columns is not a array");
    }
    if (!Array.isArray(data)) {
        throw new Error("data is not a array");
    }

    return (
        <div>
            {(isLoading || isError) ?
                <Loader active inline /> :
                <Table
                    compact
                    padded
                >
                    <Table.Header>
                        <Table.Row>
                            {columns.map(column => {
                                return (
                                    <Table.HeaderCell
                                        key={column}
                                    >
                                        {column}
                                    </Table.HeaderCell>
                                )
                            })}
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {data.map((dataEntry, idx) => {
                            return (
                                <Table.Row
                                    key={idx}
                                >
                                    {dataEntry.map(entry => {
                                        return (
                                            <Table.Cell
                                                key={entry}
                                            >
                                                {entry}
                                            </Table.Cell>
                                        )
                                    })}
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table>
            }
        </div>
    )
}