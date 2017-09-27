import React, { Component } from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import Houston from './lib/shared';
import { DEFAULTS } from '../imports/constants';

import HoustonMasterLayout from '../imports/ui/layouts/MasterLayout';

const publicSettings = Meteor.settings && Meteor.settings.public;

Houston._ROOT_ROUTE = publicSettings.houston_root_route || DEFAULTS._ROOT_ROUTE;  
Houston._page_length = publicSettings.houston_documents_per_page || DEFAULTS._page_length;  
Houston._subscribe = name => Meteor.subscribe(Houston._houstonize(name));
Houston._houstonize_route = name => Houston._houstonize(name).slice(1);
Houston._go = (route_name, options) => Router.go(Houston._houstonize_route(route_name), options);
Houston.createPath = (path) => {
  const newPath = `${Houston._ROOT_ROUTE}/${path}`;
  return newPath;
};

Houston._show_flash = function(err, result) {
  Houston._session('flash_error', (err != null));
  if (err) {
    Houston._session('flash_message', `Error: ${err.message}`);
  } else {
    Houston._session('flash_message', result);
  }
  Houston._session('flash_show', true);
  setTimeout((() => Houston._session('flash_show', false)), 2000);
};


Houston._subscribe_to_collections();

class AdminRoutes extends Component {
  constructor(props) {
    super(props);
    this.houston_route = this.houston_route.bind(this);
  }

  renderTemplate(options) {
    return <HoustonMasterLayout {...options}/>;
  }

  houston_route(route_name, options) {
    // Append _houston_ to template and route names to avoid clobbering parent route namespace
    options.history = this.props.history;
    options.layoutTemplate = '_houston_master_layout';
    options.name = Houston._houstonize_route(route_name);
    options.componentName = Houston._houstonize_route(options.template);
    options.template = Houston._houstonize(options.template);
    options.waitOn = function() {
      const subscriptions = options.subs ? options.subs(this.params) : [];
      subscriptions.push(Houston._subscribe('admin_user'));
      return subscriptions;
    };

    return <Route
        exact path={`${Houston._ROOT_ROUTE}${options.houston_path}`}
        {...options}
        render={ props => this.renderTemplate(options) }
      />
  }



  render() {
    const { history } = this.props;

    return (
      <Router history={history}>
        <div className="Admin">
          <Switch>
            {
              this.houston_route('home', {
                houston_path: '/',
                template: 'db_view',
                waitOn() { return Houston._collections; }
              })
            }
            {
              this.houston_route('login', {
                houston_path: '/login',
                template: 'login',
              })
            }
            {
              this.houston_route('collection', {
                houston_path: '/:collection_name',
                template: 'collection_view',
                // data() { return Houston._get_collection(this.params.collection_name); },
                // subs(params) { return [setup_collection(params.collection_name)]; },
              })
            }
          </Switch>
        </div>
      </Router>
    );
  }
}

export { Houston, AdminRoutes };

// For debugging purposes, uncomment:
window.Houston = Houston;
