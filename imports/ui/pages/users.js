import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router-dom';
import Houston from '../../../client/lib/shared';

class houston_users extends Component {
  constructor(props) {
    super(props);

    this.state = {
      customRole: '',
      selectedUser: null,
      username: '',
      email: '',
      password: '',
      roles: [],
    };

    this.handleSelectRole = this.handleSelectRole.bind(this);
    this.handleInputCustomRole = this.handleInputCustomRole.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.isChecked = this.isChecked.bind(this);
    this.renderUsers = this.renderUsers.bind(this);
  }

  handleSelectRole(e) {
    const target = e.target;
    const role = target.value;
    let roles = this.state.roles || [];

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

  handleInputCustomRole(e) {
    const target = e.target;
    const customRole = target.value;
    this.setState({ customRole });
  }

  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const { selectedUser, username, email, password, roles } = this.state;

    if (selectedUser) {
      Meteor.call('_houston_edit_user', selectedUser, { username, email, password, roles }, (error) => {
        if (error) {
          console.error(error);
        } else {
          this.cancelEdit();
        }
      });
    } else {
      Meteor.call('_houston_create_user', { username, email, password, roles }, (error) => {
        if (error) {
          console.error(error);
        } else {
          this.cancelEdit();
        }
      });
    }
  }

  cancelEdit() {
    this.setState({
      customRole: '',
      selectedUser: null,
      username: '',
      email: '',
      password: '',
      roles: [],
    });
  }

  selectUser(user) {
    this.setState({
      selectedUser: user._id,
      username: user.username,
      email: user.emails[0].address,
      roles: user.roles,
    });
  }

  isChecked(role) {
    const { roles } = this.state;
    return _.contains(roles, role);
  }

  renderUsers() {
    const { users } = this.props;

    return (
      <table className="table table-hover">
        <tbody>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Edit</th>
          </tr>
          {users.map(user =>
            <tr key={user._id}>
              <td>{user._id}</td>
              <td>{user.username}</td>
              <td>{user.emails[0].address}</td>
              <td>{user.roles && user.roles.join(', ')}</td>
              <td><a href="#" onClick={this.selectUser.bind(this, user)}><i className="fa fa-pencil"></i></a></td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }

  render() {
    const { roles } = this.props;
    const { selectedUser, username, email, password } = this.state;

    return (
      <div className="houston-users">
        <div className="container houston-form">
          <form id="houston-change-password-form" role="form" onSubmit={this.handleSubmit}>
            <h1 className="form-heading">
              {selectedUser ? `Edit user ${selectedUser}` : 'Create user'}
            </h1>
            <input type="text" className="form-control" placeholder="Username"
                   name="username" required autoFocus
                   value={username}
                   onChange={this.handleChange} />
            <input type="text" className="form-control" placeholder="Email"
                   name="email" required
                   value={email}
                   onChange={this.handleChange} />
            <input type="password" className="form-control" placeholder="Password"
                   name="password" required={!selectedUser}
                   value={password}
                   onChange={this.handleChange} />
            <h5>Roles:</h5>
            {
              roles.map(role =>
                <div className="role-box" key={role._id}>
                  <label>
                    <input
                      name="roles"
                      type="checkbox"
                      value={role.name}
                      checked={this.isChecked(role.name)}
                      onChange={this.handleSelectRole} /> &nbsp;
                    {role.name}
                  </label>
                </div>
              )
            }
            <div className="role-box role-box-custom">
              <label>
                <input
                  name="roles"
                  type="checkbox"
                  value={this.state.customRole}
                  checked={this.state.customRole.length}
                  onChange={this.handleSelectRole} /> &nbsp;
                <input 
                  className="custom-role-input"
                  name="custom-role"
                  type="text"
                  placeholder="new custom role ..."
                  value={this.state.customRole}
                  onChange={this.handleInputCustomRole}/>
              </label>
            </div>

            <div>
              {
                selectedUser ?
                  <div>
                    <button className="btn btn-lg btn-primary btn-block" type="submit">
                      <i className="fa fa-pencil"></i>Edit user
                    </button>
                    <button className="btn btn-lg btn-primary btn-block" onClick={this.cancelEdit}>
                      <i className="fa fa-remove"></i>Cancel
                    </button>
                  </div> :
                  <button className="btn btn-lg btn-primary btn-block" type="submit">
                    <i className="fa fa-user-plus"></i>Create user
                  </button>
              }
            </div>

          </form>
        </div>

        <h4>Or select a user to edit:</h4>
        {this.renderUsers()}
      </div>
    );
  }
}

const houston_users_with_data = withTracker(() => {
  Houston._subscribe('users');

  return {
    users: Meteor.users.find().fetch(),
  };

})(houston_users);

export default withRouter(houston_users_with_data);
