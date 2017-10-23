import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { render } from 'react-dom';
import createHistory from 'history/createBrowserHistory';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import Houston from './lib/shared';
import { DEFAULTS } from '../imports/constants';

import HoustonMasterLayout from '../imports/ui/layouts/MasterLayout';

const history = createHistory();
const publicSettings = Meteor.settings && Meteor.settings.public;

Houston._ROOT_ROUTE = publicSettings.houston_root_route || DEFAULTS._ROOT_ROUTE;  
Houston._page_length = publicSettings.houston_documents_per_page || DEFAULTS._page_length;  
Houston._app_div_id = publicSettings.houston_app_div_id || DEFAULTS._app_div_id;
Houston._admin_div_id = publicSettings.houston_admin_div_id || DEFAULTS._admin_div_id;
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

BASE_HOUSTON_ROUTES = _.map([
  'home',
  'collection',
  'document',
  'change_password',
  'custom_template'
], name => Houston._houstonize_route(name));

Houston._subscribe_to_collections();

class Routes extends Component {
  constructor(props) {
    super(props);
    this.hideApp = this.hideApp.bind(this);
    this.houston_route = this.houston_route.bind(this);
  }

  renderTemplate(options) {
    this.hideApp();
    return <HoustonMasterLayout {...options}/>;
  }

  hideApp() {
    $(`#${Houston._app_div_id}`).hide();
    $(`#${Houston._admin_div_id}`).show();
  }

  houston_route(route_name, options) {
    const { loggedIn, loggingIn, userIsAdmin, rolesReady } = this.props;
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
        render={props => {
          if (_.contains(BASE_HOUSTON_ROUTES, options.name)) {
            if (! loggedIn) {
              if (loggingIn) {
                return <div>Loading...</div>;
                // return this.render('houstonLoading');
              } else {
                return <Redirect to={`${Houston._ROOT_ROUTE}/login`}/>
              }
            } else {
              if (rolesReady && ! userIsAdmin) {
                return <Redirect to={`${Houston._ROOT_ROUTE}/login`}/>
              } 
            }
          }
          return this.renderTemplate(options);
        }}
      />;
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
              this.houston_route('change_password', {
                houston_path: '/password',
                template: 'change_password'
              })
            }
            {
              this.houston_route('custom_template', {
                houston_path: '/actions/:template',
                template: 'custom_template_view',
                // data() { return this.params; }
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
            {
              this.houston_route('document', {
                houston_path: '/:collection/:_id',
                // data() {
                //   this.subscription = setup_collection(this.params.collection, this.params._id);
                //   const collection = Houston._get_collection(this.params.collection);
                //   const document = collection.findOne({_id: this.params._id});
                //   return {document, collection, name: this.params.collection};
                // },
                template: 'document_view'
              })
            }
          </Switch>
        </div>
      </Router>
    );
  }
}

const AdminRoutes = withTracker((props) => {
  return {
    loggedIn: Meteor.user(),
    loggingIn: Meteor.loggingIn(),
    rolesReady: Houston._subscribe('roles').ready(),
    userIsAdmin: Houston._user_is_admin(Meteor.userId()),
  };

})(Routes);

export { Houston, AdminRoutes };


$(document).ready(function () {
  var adminRootDiv = document.createElement('div');
  adminRootDiv.id = Houston._admin_div_id;
  document.body.appendChild(adminRootDiv);
  render(<AdminRoutes history={history} />, adminRootDiv);
});

// For debugging purposes, uncomment:
window.Houston = Houston;
