import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Houston from '../../../client/lib/shared';

class houston_change_password extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const { history } = this.props;
    const currentPassword = this.currentPassword.value;
    const newPassword = this.newPassword.value;

    Accounts.changePassword(currentPassword, newPassword, (error) => {
      if (error) {
        return alert(error);
      } else {
        history.push(Houston._ROOT_ROUTE);
      }
    });
  }

  render() {
    return (
      <div className="container houston-form">
        <form id="houston-change-password-form" role="form" onSubmit={this.handleSubmit}>
          <h1 className="form-heading">
            Change password
          </h1>
          <input type="password" className="form-control" placeholder="Current Password"
                 name="houston-current-password" required autoFocus
                 ref={input => this.currentPassword = input} />
          <input type="password" className="form-control" placeholder="New Password"
                 name="houston-new-password" required
                 ref={input => this.newPassword = input} />

          <div>
            <button className="btn btn-lg btn-primary btn-block" type="submit"><i
                className="fa fa-pencil"></i>Change
              Password
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default withRouter(houston_change_password);
