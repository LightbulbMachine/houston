import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router-dom';
import HoustonLink from './link';
import Houston from '../../../client/lib/shared';

class houston_navbar extends Component {
  constructor(props) {
    super(props);
    this.handleLogout = this.handleLogout.bind(this);
    this.isActive = this.isActive.bind(this);
    this.renderIfAdmin = this.renderIfAdmin.bind(this);
    this.renderPasswordLink = this.renderPasswordLink.bind(this);
    this.renderLogoutLink = this.renderLogoutLink.bind(this);
  }

  bugreport_url() {
    const message = encodeURIComponent(`\
      To make sure we can help you quickly, please include the version of Houston
      you are using, steps to replicate the issue, a description of what you were
      expecting and a screenshot if relevant.

      Thanks!\
      `
    );
    return `https://github.com/zzaacchh/houston/issues/new?body=${message}`;
  }

  handleLogout(e) {
    e.preventDefault();
    const { history } = this.props;
    Meteor.logout();
    // going 'home' clears the side nav
    history.push(Houston._ROOT_ROUTE);
  }

  isActive(path) {
    const { history } = this.props;
    return history && history.location && history.location.pathname === path ? 'active' : '';
  }

  renderIfAdmin() {
    const { currentUserIsAdmin, menu_items, history } = this.props;
    
    return currentUserIsAdmin &&
      menu_items.map(item => <li className={this.isActive(item.path)} key={item.title}>
        <HoustonLink target={item.target} href={item.path} history={history}>{item.title}</HoustonLink>
      </li>);
  }

  renderPasswordLink() {
    const { currentUser, history } = this.props;
    return currentUser &&
      <li>
        <HoustonLink href={`${Houston._ROOT_ROUTE}/password`} history={history}><i
            className="fa fa-pencil"></i>Change password</HoustonLink>
      </li>;

  }

  renderLogoutLink() {
    const { currentUser } = this.props;
    return currentUser &&
      <li>
        <a id="houston-logout" href="#" onClick={this.handleLogout}>Log out&nbsp;<i
            className="fa fa-sign-out"></i></a>
      </li>;

  }

  render() {
    const { history } = this.props;

    return (
      <div className="navbar navbar-inverse navbar-fixed-top">

        <div className="container-fluid">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle" data-toggle="collapse"
                    data-target=".navbar-collapse">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <HoustonLink className="navbar-brand brand" href={Houston._ROOT_ROUTE} history={history}>Houston
              <small>Meteor Admin</small>
            </HoustonLink>
          </div>
          <div className="navbar-collapse collapse">
            <ul className="nav navbar-nav pull-right">
              {this.renderIfAdmin()}
              <li>
                <a id="houston-report-bug" href={this.bugreport_url()} target="_blank">
                  <i className="fa fa-bug"></i>Report a Bug
                </a>
              </li>
              {this.renderPasswordLink()}
              {this.renderLogoutLink()}
            </ul>
          </div>
          {/*<!--/.nav-collapse -->*/}
        </div>

      </div>
    );
  }
}

const houston_navbar_with_data = createContainer((props) => {
  return {
    currentUser: Meteor.user(),
    currentUserIsAdmin: Houston._user_is_admin(Meteor.userId()),
    menu_items: Houston.menu._get_menu_items(),
  };

}, houston_navbar);

export default withRouter(houston_navbar_with_data);

