import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { withRouter, Link } from 'react-router-dom';
import HoustonLink from './link';
import Houston from '../../../client/lib/shared';

class houston_sidenav extends Component {
  constructor(props) {
    super(props);
    this.renderCollections = this.renderCollections.bind(this);
  }

  is_active(name) {
    return name === Houston._session('collection_name') ? 'active' : '';
  }

  renderCollections() {
    const { collections, history } = this.props;

    return collections.map( col =>
      <li key={col._id} className={this.is_active(col.name)}>
        <HoustonLink href={`${Houston._ROOT_ROUTE}/${col.name}`} history={history}>
          {col.name}
          <span className="badge pull-right">{col.count}</span>
        </HoustonLink>
      </li> );
  }

  render() {
    const { loading, collections, history } = this.props;
    
    return loading ? <div>Loading</div> : (
      <div>
        <h6><i className="fa fa-database"></i>Collections</h6>
        {/*{#if currentUserIsAdmin}*/}
        <ul className="nav nav-sidebar">
          {this.renderCollections()}
        </ul>
        {/*{/if}*/}
        <hr />

        <ul className="nav nav-sidebar">
          <li><HoustonLink href="/" history={history}><i className="fa fa-reply"></i>Back to Root</HoustonLink></li>
        </ul>
      </div>
    );
  }
}

const houston_sidenav_with_data = createContainer(({ waitOn, data }) => {
  const subs = waitOn();
  const { collections } = Houston._collections;

  let loading = true;
  let stillLoading = true;

  _.each(subs, function(sub, key, list){
    if (sub.ready()) {
      stillLoading = false;
    } else {
      stillLoading = true;
    }
  });

  if (! stillLoading) {
    loading = false;
  }

  return {
    loading,
    collections: collections._collection.find().fetch(),
  };

}, houston_sidenav);

export default withRouter(houston_sidenav_with_data);
