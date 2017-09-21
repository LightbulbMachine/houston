import React, { Component } from 'react';

export default class houston_navbar extends Component {
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
              {/*{#if currentUser}}
                <li>
                  <a href="{{pathFor 'houston_change_password'}}"><i
                      className="fa fa-pencil"></i>Change password</a>
                </li>
                <li>
                  <a id="houston-logout" href="#">Log out&nbsp;<i
                      className="fa fa-sign-out"></i></a>
                </li>
              {{/if}*/}
            </ul>
          </div>
          {/*<!--/.nav-collapse -->*/}
        </div>

      </div>
    );
  }
}
