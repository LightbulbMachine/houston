import React, { Component } from 'react';

import bootstrap from '../third-party/bootstrap';
import collapsejs from '../third-party/collapsejs';
import style_css from '../stylesheets/style_css';

import houston_navbar from '../partials/navbar';
import houston_sidenav from '../partials/sidenav';
import houston_flash_message from '../partials/flash_message';

import houston_login from '../pages/admin_login';
import houston_change_password from '../pages/admin_change_password';
import houston_db_view from '../pages/db_view';
import houston_collection_view from '../pages/collection_view';
import houston_document_view from '../pages/document_view';

// TODO: We should definitely remove this workaround in future versions
const componentsList = {
  bootstrap,
  collapsejs,
  style_css,
  houston_navbar,
  houston_sidenav,
  houston_flash_message,
  houston_change_password,
  houston_login,
  houston_db_view,
  houston_collection_view,
  houston_document_view,
};


export default class HoustonMasterLayout extends Component {
  constructor(props) {
    super(props);
    this.renderComponent = this.renderComponent.bind(this);
    this.yield = this.yield.bind(this);
  }

  renderComponent(componentName) {
    const ComponentToRender = componentsList[componentName];
    return <ComponentToRender {...this.props} />;
  }

  yield() {
    const { componentName } = this.props;
    return this.renderComponent(componentName);
  }

  render() {
    const { history } = this.props;

    return <div className="houston">
      {/*<!-- Meteor makes all CSS and JS global to the app.
         To avoid polluting the user's namespace, we inject third-party JS and CSS through templates.
         Ugly? Yes. Effective? Enough. -->*/}
      {this.renderComponent('bootstrap')}
      {this.renderComponent('collapsejs')}
      {this.renderComponent('style_css')}
      {this.renderComponent('houston_navbar')}
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-3 col-md-2 sidebar">
            {this.renderComponent('houston_sidenav')}
          </div>
          <div className="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">
            {this.yield()}
            {this.renderComponent('houston_flash_message')}
          </div>
        </div>
      </div>

    </div>;
  }
}
