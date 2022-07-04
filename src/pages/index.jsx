import dayjs from "dayjs";
import { useState } from "react";
import { Container, Grid, Loader, Table } from "semantic-ui-react";
import { useInvoices, useInvoicesSummary } from "../utils";
import DynamicTable from "../components/DynamicTable";
import DoughnutChart from "../components/DoughnutChart";

export default function Home() {

    // Set currMonthAndYear to be the first day of the current month
    const [currMonthAndYear, setCurrMonthAndYear] = useState(dayjs());

    // Get invoice summary data by category
    const summaryByCategory = useInvoicesSummary({
        fromDate: currMonthAndYear.format('YYYY-MM'),
        type: 'category'
    });

    // Get invoice summary data by billingType
    const summaryByBillingType = useInvoicesSummary({
        fromDate: currMonthAndYear.format('YYYY-MM'),
        type: 'billingType'
    });

    // Get top 10 invoices of the month ordered by price
    const invoicesByPrice = useInvoices({
        fromDate: currMonthAndYear.format('YYYY-MM'),
        orderBy: 'price',
        limit: 10
    })

    return (
        <div>
            <Container>
                <h1>Own finances</h1>
                <h2>Invoice summary for {currMonthAndYear.format('MMMM YYYY')}</h2>
                <Grid columns={2} >
                    <Grid.Column>
                        <h3>Summary of expenses by category</h3>
                        <DynamicTable
                            columns={['Name', 'Price']}
                            data={summaryByCategory.data.map(entry => {
                                // Turn object into an array of items
                                return Object.values(entry);
                            })}
                            isLoading={summaryByCategory.isLoading}
                            isError={summaryByCategory.isError}
                        />
                    </Grid.Column>
                    <Grid.Column>
                        <h3>Summary of expenses by billing type</h3>
                        <DynamicTable
                            columns={['Name', 'Price']}
                            data={summaryByBillingType.data.map(entry => {
                                // Turn object into an array of items
                                return Object.values(entry);
                            })}
                            isLoading={summaryByBillingType.isLoading}
                            isError={summaryByBillingType.isError}
                        />
                    </Grid.Column>
                </Grid>
                <Grid columns={3}>
                    <Grid.Column>
                        <h3>Top 10 invoices of the month ordered by price</h3>
                        <DynamicTable
                            columns={['Name', 'Category', 'Price', 'Installment']}
                            data={invoicesByPrice.data.map(entry => {
                                return [
                                    entry.name,
                                    entry.category.name,
                                    entry.price,
                                    entry.installments ?
                                        `${currMonthAndYear.endOf('month').diff(dayjs(entry.purchaseDate), 'month') + 1}/${entry.installments}` :
                                        'N.A.'
                                ];
                            })}
                            isLoading={invoicesByPrice.isLoading}
                            isError={invoicesByPrice.isError}
                        />
                    </Grid.Column>
                    <Grid.Column>
                        <h2>Category summary</h2>
                        <DoughnutChart
                            labels={summaryByCategory.data.map(entry => {
                                return entry.name;
                            })}
                            data={summaryByCategory.data.map(entry => {
                                return entry.price;
                            })}
                        />
                    </Grid.Column>
                    <Grid.Column>
                        <h2>Billing type summary</h2>
                        <DoughnutChart
                            labels={summaryByBillingType.data.map(entry => {
                                return entry.name;
                            })}
                            data={summaryByBillingType.data.map(entry => {
                                return entry.price;
                            })}
                        />
                    </Grid.Column>
                </Grid>
            </Container>
        </div >
    )
}