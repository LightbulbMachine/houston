import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router-dom';
import HoustonLink from '../partials/link';
import Houston from '../../../client/lib/shared';
import { validatePassword, validateLogin, validateEmail } from '../../util/validate';

class houston_login extends Component {
  constructor(props) {
    super(props);
    this.afterLogin = this.afterLogin.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.renderInfo = this.renderInfo.bind(this);
    this.renderForm = this.renderForm.bind(this);
  }

  afterLogin(error) {
    const { history } = this.props;
    // TODO error case that properly displays
    if (error) {
      return console.error(error);
    } else {
      history.push(Houston._ROOT_ROUTE);
    }
  };

  handleSubmit(e) {
    e.preventDefault();
    const { history } = this.props;
    const email = this.email.value;
    const password = this.password.value;

    Meteor.loginWithPassword(email, password, this.afterLogin);
  }

  handleLogout(e) {
    e.preventDefault();
    const { history } = this.props;
    Meteor.logout();
    // going 'home' clears the side nav
    history.push(Houston._ROOT_ROUTE);
  }


  renderHeading() {
    const { currentUserIsAdmin } = this.props;
    return currentUserIsAdmin ?
      <h1 className="form-heading">You are currently logged in as an Admin.</h1> :
      <h1 className="form-heading">You are not an Admin. If you need to use the Houston Admin, please ask your Admin to grant you access.</h1> ;
  }

  // user logged in
  renderInfo() {
    const { loggedIn, history } = this.props;

    return loggedIn && (
      <div>
        {this.renderHeading()}
        <div>
          <HoustonLink href={Houston._ROOT_ROUTE} history={history} className="btn btn-primary col-xs-6">
            <i className="fa fa-home"></i>Back to Home
          </HoustonLink>
          <button id="houston-logout" className="btn btn-warning col-xs-6" onClick={this.handleLogout}>
            <i className="fa fa-sign-out"></i>Log out
          </button>
        </div>
      </div>
    );
  }

  // nobody is logged in - sign in
  renderForm() {
    const { loggedIn } = this.props;

    return ! loggedIn && (
      <form id="houston-sign-in-form" role="form" onSubmit={this.handleSubmit}>
        <h1 className="form-heading">
          Log In
        </h1>
        <input type="text" className="form-control" placeholder="Username or Email address"
               name="houston-email"
               id='houston-email' required autoFocus
               ref={input => this.email = input} />
        <input type="password" className="form-control" placeholder="Password"
               name="houston-password"
               id='houston-password' required
               ref={input => this.password = input} />
        <div>
          <button
              className="btn btn-lg btn-primary btn-block"
              type="submit">
            Log In
          </button>
        </div>
      </form>
    );
  }
  
  render() {
    const { loggedIn } = this.props;

    return (<div className="container houston-form">
      {this.renderInfo()}
      {this.renderForm()}
    </div>);
  }
}

const houston_login_with_data = withTracker((props) => {
  return {
    loggedIn: Meteor.user(),
    currentUserIsAdmin: Houston._user_is_admin(Meteor.userId()),
  };

})(houston_login);

export default withRouter(houston_login_with_data);
