import useSWR from 'swr';

const fetcher = (...args) => fetch(...args).then(res => res.json());

const INVOICE_API_URL = '/api/invoice';
const BILLING_TYPE_API_URL = '/api/billingType';
const CATEGORY_API_URL = '/api/category';

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

function useInvoices() {
    const { data, error } = useSWR(INVOICE_API_URL, fetcher);

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
    INVOICE_API_URL,
    BILLING_TYPE_API_URL,
    CATEGORY_API_URL
}