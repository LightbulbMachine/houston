import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router-dom';
import Houston from '../../../client/lib/shared';

class houston_sidenav extends Component {
  constructor(props) {
    super(props);
    this.renderCollections = this.renderCollections.bind(this);
  }

  handleClick(path) {
    const { history } = this.props;
    history.push(path);
    return true;
  }
  
  // collections() {
  //   return Houston._collections.collections.find().fetch();
  // }

  is_active(name) {
    return name === Houston._session('collection_name') ? 'active' : '';
  }

  renderCollections() {
    const { collections } = this.props;
    // const collections = this.collections();
    return collections.map( col =>
      <li key={col._id} className={this.is_active(col.name)}>
        <a href={'#'/*{pathFor 'houston_collection' collection_name=name }*/}>
          {col.name}
          <span className="badge pull-right">{col.count}</span>
        </a>
      </li> );
  }

  render() {
    const { loading, collections } = this.props;
    
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
          <li><a href="#"onClick={ () => this.handleClick('/') }><i className="fa fa-reply"></i>Back to Root</a></li>
        </ul>
      </div>
    );
  }
}

const houston_sidenav_with_data = createContainer(({ waitOn, data }) => {
  const subs = waitOn();
  const payloadData = data();
  const { collections } = payloadData;

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
