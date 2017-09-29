import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router-dom';

class houston_navbar extends Component {
  constructor(props) {
    super(props);
    this.handleLogout = this.handleLogout.bind(this);
    this.renderPasswordLink = this.renderPasswordLink.bind(this);
    this.renderLogoutLink = this.renderLogoutLink.bind(this);
  }

  handleLogout(e) {
    e.preventDefault();
    const { history } = this.props;
    Meteor.logout();
    // going 'home' clears the side nav
    history.push(Houston._ROOT_ROUTE);
  }

  renderPasswordLink() {
    const { currentUser } = this.props;
    return currentUser &&
      <li>
        <a href="{{pathFor 'houston_change_password'}}"><i
            className="fa fa-pencil"></i>Change password</a>
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
            <a className="navbar-brand brand" href={'#'/*pathFor 'houston_home'*/}>Houston
              <small>Meteor Admin</small>
            </a>
          </div>
          <div className="navbar-collapse collapse">
            <ul className="nav navbar-nav pull-right">
              {/*{#if currentUserIsAdmin }}
                {{#each menu_items}}
                <li className="{{isActive}}">
                  <a target="{{target}}" href="{{path}}">{{title}}</a>
                </li>
                {{/each}}
              {{/if}*/}
              <li>
                <a id="houston-report-bug" href={'#'/*bugreport_url*/} target="_blank">
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
  };

}, houston_navbar);

export default withRouter(houston_navbar_with_data);

