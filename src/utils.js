import useSWR from 'swr';

const fetcher = (url, queryParams = '') => fetch(`${url}${queryParams}`).then(res => res.json());

const INVOICE_API_URL = '/api/invoice';
const BILLING_TYPE_API_URL = '/api/billingType';
const CATEGORY_API_URL = '/api/category';

function queryParamsFormatter(queryParams) {
    // Reduce queryParams to a uri formatted string
    const queryString = Object.keys(queryParams).reduce((acc, currParam) => {
        const currParamContent = queryParams[currParam];
        if (!acc) {
            acc += `?${currParam}=${currParamContent}`;
        } else {
            acc += `&${currParam}=${currParamContent}`;
        }
        acc = encodeURI(acc);
        return acc;
    }, '');

    return queryString;
}

function useBillingTypes() {
    const { data, error } = useSWR(BILLING_TYPE_API_URL, fetcher);

    return {
        data: (data && data.data) || [],
        isLoading: !data && !error,
        isError: error
    }
}

function useCategories() {
    const { data, error } = useSWR(CATEGORY_API_URL, fetcher);

    return {
        data: (data && data.data) || [],
        isLoading: !data && !error,
        isError: error
    }
}

function useInvoices(queryParams) {
    // Reduce queryParams to a uri formatted string
    const queryString = queryParamsFormatter(queryParams);
    const { data, error, mutate } = useSWR([INVOICE_API_URL, queryString], fetcher);

    return {
        data: (data && data.data) || [],
        isLoading: !data && !error,
        isError: error,
        mutate
    }
}

function useInvoicesSummary(queryParams) {
    // Reduce queryParams to a uri formatted string
    const queryString = queryParamsFormatter(queryParams);
    const url = `${INVOICE_API_URL}/summary`
    const { data, error } = useSWR([url, queryString], fetcher);

    return {
        data: (data && data.data) || [],
        isLoading: !data && !error,
        isError: error
    }
}

export {
    useBillingTypes,
    useCategories,
    useInvoices,
    useInvoicesSummary,
    INVOICE_API_URL,
    BILLING_TYPE_API_URL,
    CATEGORY_API_URL
}