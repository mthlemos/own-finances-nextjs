import useSWR from 'swr';

const fetcher = (...args) => fetch(...args).then(res => res.json());

function useBillingTypes() {
    const { data, error } = useSWR('/api/billingType', fetcher);

    return {
        data: (data && data.data) || [],
        isLoading: !data && !error,
        isError: error
    }
}

function useCategories() {
    const { data, error } = useSWR('/api/category', fetcher);

    return {
        data: (data && data.data) || [],
        isLoading: !data && !error,
        isError: error
    }
}

export {
    useBillingTypes,
    useCategories
}