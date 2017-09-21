import React, { Component } from 'react';

export default class houston_db_view extends Component {
  render() {
    return (
      <div>
        <ul className="breadcrumb">
          <li className="active"><i className="fa fa-home"></i>Home</li>
        </ul>
        <h1>Houston
          <small>Meteor Admin Panel</small>
        </h1>

        <input name="name" id="search" placeholder="Search"
               className="form-control houston-column-filter input-lg"
               type="text" autoFocus/>
        {/*{# unless collections }}
        <p className="lead">If this is your first time using Houston, you may need to <a
            id="refresh"
            className="btn btn-large btn btn-block btn-warning">Refresh
          this page</a></p>
        {{/unless}*/}
        {/*{# unless filtered_collections }}
        <p className="lead">Your search returned no results.</p>
        {{/unless}*/}
        {/*{#each filtered_collections}}
        <a href="{{pathFor 'houston_collection' collection_name=name}}">
          <div className="col-sm-6 col-md-4 col-lg-3">
            <h4 className="well well-sm houston-collection">
              <i className="fa fa-database"></i>{{name}}
              <span className="badge pull-right">{{ count }}</span>
            </h4>

          </div>
        </a>
        {{/each}*/}
      </div>
    );
  }
}
