import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withRouter, Redirect } from 'react-router-dom';
import Houston from '../../../client/lib/shared';

class houston_custom_template_view extends Component {
  render() {
    const { houstonMenuItem, CustomComponent } = this.props;

    // For this to work, you must pass a react component from
    // within your app when defining custom menu items, e.g.:
    // 
    // Houston.menu({
    //   'type': 'template',
    //   'use': 'some-action', // generates the `/actions/some-action` route
    //   'component': MyComponent, // an actual react component
    //   'title': 'My Component'
    // });

    return CustomComponent ? 
      <CustomComponent houstonMenuItem={houstonMenuItem} /> :
      <Redirect to={Houston._ROOT_ROUTE} />;
  }
}

const houston_custom_template_view_with_data = withTracker(({ match }) => {
  const { template } = match.params;
  const menuItems = Houston.menu._menu_items;

  // Find the custom menu item corresponding to the current route
  const houstonMenuItem = _.find(menuItems, (item) => {
    return item.use === template;
  });

  // Get the react component passed from the app via `Houston.menu()`
  const CustomComponent = houstonMenuItem && houstonMenuItem.component;

  return {
    houstonMenuItem,
    CustomComponent,
  };

})(houston_custom_template_view);

export default withRouter(houston_custom_template_view_with_data);
