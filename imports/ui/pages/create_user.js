import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Houston from '../../../client/lib/shared';

class houston_create_user extends Component {
  constructor(props) {
    super(props);

    this.state = {
      roles: []
    };

    this.handleSelectRole = this.handleSelectRole.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSelectRole(event) {
    const target = event.target;
    const role = target.value;
    let roles = this.state.roles;

    if (target.checked) {
      roles.push(role);
    } else {
      roles = _.reject(roles, (value) => {
        return value === role;
      });
    }

    this.setState({
      roles
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const { history } = this.props;
    const username = this.username.value;
    const email = this.email.value;
    const password = this.password.value;
    const { roles } = this.state;

    Meteor.call('_houston_create_user', { username, email, password, roles }, (error) => {
      if (error) {
        return alert(error);
      } else {
        history.push(Houston._ROOT_ROUTE);
      }
    });
  }

  render() {
    const { roles } = this.props;

    return (
      <div className="container houston-form">
        <form id="houston-change-password-form" role="form" onSubmit={this.handleSubmit}>
          <h1 className="form-heading">
            Create user
          </h1>
          <input type="text" className="form-control" placeholder="Username"
                 name="houston-username" required autoFocus
                 ref={input => this.username = input} />
          <input type="text" className="form-control" placeholder="Email"
                 name="houston-email" required
                 ref={input => this.email = input} />
          <input type="password" className="form-control" placeholder="Password"
                 name="houston-password" required
                 ref={input => this.password = input} />
          <h5>Roles:</h5>
          {
            roles.map(role =>
              <div className="role-box" key={role._id}>
                <label>
                  <input
                    name="roles"
                    type="checkbox"
                    value={role.name}
                    onChange={this.handleSelectRole} /> &nbsp;
                  {role.name}
                </label>
              </div>
            )
          }

          <div>
            <button className="btn btn-lg btn-primary btn-block" type="submit"><i
                className="fa fa-user-plus"></i>Create user
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default withRouter(houston_create_user);
