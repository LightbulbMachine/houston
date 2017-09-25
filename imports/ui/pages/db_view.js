import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router-dom';

class houston_db_view extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filter: '',
    };

    this.filterCollections = this.filterCollections.bind(this);
    this.renderWarning = this.renderWarning.bind(this);
    this.renderCollections = this.renderCollections.bind(this);
    this.setFilter = this.setFilter.bind(this);
  }

  setFilter(e) {
    const filter = e.target.value;
    this.setState({ filter });
  }

  filterCollections(filter, collections) {
    if (filter) {
      return _.filter(collections, c => (c.name).indexOf(filter) > -1);
    } else {
      return collections;
    }
  }

  renderWarning() {
    const { collections } = this.props;

    if (!collections) {
      return <p className="lead">If this is your first time using Houston, you may need to <a
        id="refresh"
        className="btn btn-large btn btn-block btn-warning">Refresh
      this page</a></p>;
    }
  }

  renderCollections() {
    const { filter } = this.state;
    const { collections } = this.props;
    const filteredCollections = this.filterCollections(filter, collections);
    
    return filteredCollections.map( col =>
      <a key={col._id} href={'#'/*{pathFor 'houston_collection' collection_name=name}*/}>
        <div className="col-sm-6 col-md-4 col-lg-3">
          <h4 className="well well-sm houston-collection">
            <i className="fa fa-database"></i>{col.name}
            <span className="badge pull-right">{col.count}</span>
          </h4>
        </div>
      </a> );
  }

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
               onKeyUp={this.setFilter}
               type="text" autoFocus/>
        {this.renderWarning()}
        {this.renderCollections()}
      </div>
    );
  }
}

const houston_db_view_with_data = createContainer(({ waitOn, data }) => {
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

}, houston_db_view);

export default withRouter(houston_db_view_with_data);
