import React from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import { withRouter } from 'next/router';

class MenuBar extends React.Component {
    constructor(props) {
        super(props);
        // Before setting the activeItem, check which route
        // The user is currently on
        const { router } = this.props;
        const currRoute = router.pathname === '/' ? 'home' : router.pathname.slice(1);
        this.state = {
            activeItem: currRoute
        }
    }

    handleClick = (e, { name }) => {
        const { activeItem } = this.state;
        if (activeItem !== name) {
            this.setState({
                activeItem: name
            });
            // Home path is / and since the / is appended
            // to the router, home should be an empty string
            const redirectTo = name === 'home' ? '' : name;
            const { router } = this.props;
            // Redirect to clicked page
            router.push(`/${redirectTo}`);
        }
    }

    render() {
        const { activeItem } = this.state;
        return (
            <Menu style={{ borderRadius: 0 }} inverted>
                <Menu.Item header>
                    <Icon name='money bill alternate outline' size='large' />
                </Menu.Item>
                <Menu.Item
                    name='home'
                    active={activeItem === 'home'}
                    onClick={this.handleClick}
                />
                <Menu.Item
                    name='newInvoice'
                    active={activeItem === 'newInvoice'}
                    onClick={this.handleClick}
                >
                    New Invoice
                </Menu.Item>
            </Menu>
        )
    }
}

export default withRouter(MenuBar);