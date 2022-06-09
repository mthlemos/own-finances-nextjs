import NavBar from './NavBarFunction';
import { Container } from 'semantic-ui-react';
import { SemanticToastContainer, toast } from 'react-semantic-toasts';
import { SWRConfig } from 'swr';

export default function Layout({ children }) {
    return (
        <>
            <SWRConfig value={{
                onError: (error, key) => {
                    if (error.status !== 403 || error.status !== 404) {
                        toast({
                            type: 'error',
                            description: `There was an error fetching data for endpoint "${key}"`,
                            time: 10000
                        });
                    }
                },
                refreshInterval: 0 // Should be overrided only when needed
            }}>
                <NavBar />
                <Container>
                    <SemanticToastContainer />
                </Container>
                <main>{children}</main>
            </SWRConfig>
        </>
    )
}