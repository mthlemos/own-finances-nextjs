import { useState } from 'react';
import { Menu, Icon, Container } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function NavBar() {
    // Before setting the activeItem, check which route
    // The user is currently on
    const router = useRouter();
    const currRoute = router.pathname === '/' ? 'home' : router.pathname.slice(1);
    const [activeItem, setActiveItem] = useState(currRoute);
    const routes = [
        {
            name: 'Home',
            shortName: 'home'
        },
        {
            name: 'Invoices',
            shortName: 'invoices'
        },
        {
            name: 'Categories',
            shortName: 'categories'
        },
        {
            name: 'Billing Types',
            shortName: 'billingTypes'
        }
    ];

    const handleClick = (name) => {
        if (activeItem !== name) {
            setActiveItem(name);
        }
    }

    return (
        <Menu style={{ borderRadius: 0 }} inverted>
            <Container>
                <Menu.Item header>
                    <Icon name='money bill alternate outline' size='large' />
                </Menu.Item>
                {routes.map(route => {
                    return (
                        <Link
                            key={route.shortName}
                            // Home path is / and since the / is appended
                            // to the href, home should be an empty string
                            href={`/${route.shortName === 'home' ? '' : route.shortName}`}
                            passHref
                        >
                            <Menu.Item
                                active={activeItem === route.shortName}
                                onClick={() => handleClick(route.shortName)}
                            >
                                {route.name}
                            </Menu.Item>
                        </Link>
                    )
                })}
            </Container>
        </Menu>
    )
}