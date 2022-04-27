import NavBar from './NavBarFunction';
import { Container } from 'semantic-ui-react';
import { SemanticToastContainer } from 'react-semantic-toasts';

export default function Layout({ children }) {
    return (
        <>
            <NavBar />
            <Container>
                <SemanticToastContainer />
            </Container>
            <main>{children}</main>
        </>
    )
}