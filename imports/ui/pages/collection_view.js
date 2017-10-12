import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router-dom';
import { setup_collection } from '../../util/subs';
import HoustonLink from '../partials/link';
import Houston from '../../../client/lib/shared';

class houston_collection_view extends Component {
  constructor(props) {
    super(props);
    this.num_of_records = this.num_of_records.bind(this);
  }

  num_of_records() {
    const { collection_count } = this.props;
    return collection_count || "no";
  }

  pluralize() {
    const { collection_count } = this.props;
    if (collection_count !== 1) {
      return 's';
    }
  }

  headers() {
    const { name, collection_info } = this.props;
    return get_collection_view_fields(name, collection_info);
  }

  nonid_headers() {
    const headers = this.headers();
    return headers && headers.slice(1);
  }

  renderNewDocumentFields() {
    const nonid_headers = this.nonid_headers();

    return nonid_headers && nonid_headers.map( header =>
      <HoustonNewDocumentField header={header} key={header.name} /> );
  }

  renderNonIdHeaders() {
    const nonid_headers = this.nonid_headers();

    return nonid_headers && nonid_headers.map( header =>
      <div className="form-group col-xs-12 col-sm-6 col-md-4 col-lg-3" key={header.name}>
        <div className="input-group">
          <div className="input-sm input-group-addon">{header.name}</div>
          <input className="form-control houston-column-filter input-sm"
                 type="text" data-id={header.name}
                 placeholder={header.type} value={header.filter_value} />
        </div>
      </div> );
  }

  renderHeaders() {
    const headers = this.headers();

    return headers && headers.map( header =>
      <th key={header.name}><a href="#" className="houston-sort">{header.name}</a></th> );
  }

  renderValues(row) {
    const values_in_order = this.props.values_in_order(row);
    
    return values_in_order && values_in_order.map( value =>
      <td data-field={value.field_name} key={value.field_name} className='houston-collection-field'>
        {value.field_value}
      </td> );
  }

  renderRows() {
    const { name, history } = this.props;
    const rows = this.props.rows();
    const sort_order = Houston._session('sort_order');

    return rows && rows.map( row =>
      <tr id={`ID_${sort_order}`} data-id={row._id} key={row._id}>
        <td><HoustonLink href={`${Houston._ROOT_ROUTE}/${name}/${row._id}`} history={history}><i
            className="fa fa-file"></i>{row._id}</HoustonLink></td>
        {this.renderValues(row)}
        <td className="action-cell" >
          {/*{> _houston_custom_actions collection_info=collection_info document=this size="xs" }*/}
          <div data-id={row._id}
               className="btn btn-xs houston-delete-doc btn-danger">
            <i className="fa fa-trash-o"></i>Delete {sort_order}
          </div>
        </td>
      </tr> );
  }

  render() {
    const { name, history } = this.props;

    return (
      <div>
        <ul className="breadcrumb">
          
          <li><HoustonLink href={Houston._ROOT_ROUTE} history={history} className="houston-home"><i
              className="fa fa-home"></i>Home</HoustonLink></li>
         <li className="active"><i className="fa fa-database"></i>{ name }</li>
        </ul>
        <div className="row hidden" id="houston-create-document">
          <h3>Add more { name }</h3>

          <form id="houston-create-row" className="form-horizontal" role="form">
            {this.renderNewDocumentFields()}

            <div className="form-group">
              <div className="col-sm-12">
                <button type="button" id="houston-cancel" className="btn btn-primary"><i
                    className="fa fa-times"></i>Cancel
                </button>
                <button type="button" id="houston-add"
                        className="btn btn-success pull-right"><i className="fa fa-plus"></i>Add
                </button>
              </div>
            </div>
          </form>
          <hr/>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="page-header">
              <div id="collection-page-header-actions" className="pull-right">
                <button data-name={name} className="btn btn-sm houston-delete-all btn-danger">
                  <i className="fa fa-trash-o"></i>
                  Delete all
                </button>
                <button id="houston-create-btn" className="btn btn-sm btn-success">
                  <i className="fa fa-plus"></i>
                  New {name}
                </button>
              </div>

              <h1>{name}
                <small>{ this.num_of_records() } record{ this.pluralize() }</small>
              </h1>
            </div>
          </div>
        </div>
        <div className='row'>
          <div className="col-md-12">
            <div className="panel-group" id="accordion">
              <div className="panel-heading">
                <div className="panel-title">
                  <a id="expand-filter" data-toggle="collapse" data-parent="#accordion"
                     href="#collapseOne">
                    <h4><i className="fa fa-filter"></i>Filter&nbsp;<i
                        className="fa fa-caret-down"></i></h4>
                  </a>
                </div>
              </div>
              <div id="collapseOne" className="panel-collapse collapse">
                <form className="form-inline" role="form">
                  {this.renderNonIdHeaders()}
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12" style={{ overflowX: 'auto' }}>
            <h4>
              <small>Double click any cell to edit its value.</small>
            </h4>
            <table id="data-table"
                   className="table table-condensed table-striped table-hover">
              <thead>
                <tr>
                  {this.renderHeaders()}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {this.renderRows()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

class HoustonNewDocumentField extends Component {
  render() {
    const { header } = this.props;
    return (
      <div className="form-group">
        <label htmlFor={header.name} className="col-sm-4 control-label">{header.name}</label>

        <div className="col-sm-8">
          <textarea className="input-sm houston-field form-control"
                    placeholder={header.type} name={header.name} defaultValue={header.value}></textarea>
        </div>

      </div>
    );
  }
}

const get_sort_by = () => {
  const sort_by = {};
  sort_by[Houston._session('sort_key')] = Houston._session('sort_order');
  return sort_by;
};

const get_filter_query = (collection) => {
  // Make find query using the filter stored in the session. The regexes are
  // escaped, but $regex is used so it can match anywhere in the string.
  const query = (() => {
    if (Houston._session('custom_selector')) {
      return Houston._session('custom_selector');
    } else {
      const field_query = {};
      const fill_query_with_regex = function(session_key) {
        if (Houston._session(session_key) == null) { return; }
        return (() => {
          const result = [];
          const object = Houston._session(session_key);
          for (let key in object) {
          // From http://stackoverflow.com/questions/3115150/how-to-escape-regular-expression-special-characters-using-javascript#answer-9310752
            let val = object[key];
            val = Houston._convert_to_correct_type(key, val, collection);
            if (typeof(val) === 'string') {
              result.push(field_query[key] = {$regex: val.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")});
            } else {
              result.push(field_query[key] = val);
            }
          }
          return result;
        })();
      };
      fill_query_with_regex('field_selectors');
      return field_query;
    }
  })();

  return query;
};

const get_collection_view_fields = (name, collection_info) => {
  if (collection_info && collection_info.fields) {
    return _.map(collection_info.fields, (obj) => {
      obj.collection_name = name;
      return obj;
    }) || []
  }
};

const houston_collection_view_with_data = createContainer(({ match, subs }) => {
  const { collection_name } = match.params;
  const sub = setup_collection(collection_name);
  const collection = Houston._get_collection(collection_name);
  const collection_info = Houston._collections.collections.findOne({ name: collection_name });
  const collection_count = collection_info && collection_info.count;
  
  const rows = () => {
    const query = get_filter_query(Houston._get_collection(collection_name));
    const documents = collection.find(query, {sort: get_sort_by()}).fetch();

    return _.map(documents, function(d) {
      d.collection = collection_name;
      d._id = d._id._str || d._id;
      return d;
    });
  }

  const values_in_order = (row) => {
    const fields_in_order = get_collection_view_fields(row.collection, collection_info);
    if (fields_in_order) {
      const names_in_order = _.clone(fields_in_order);
      const values = (fields_in_order.slice(1).map((field) => Houston._nested_field_lookup(row, field.name)));  // skip _id
      return ((() => {
        const result = [];
        for (let [field_value, {name:field_name}] of _.zip(values, names_in_order.slice(1))) {
          result.push({ field_value: field_value.toString(), field_name, collection: row.collection });
        }
        return result;
      })());
    }
  };

  return {
    collection,
    collection_info,
    collection_count,
    rows,
    values_in_order,
    name: collection_name,
  };

}, houston_collection_view);

export default withRouter(houston_collection_view_with_data);
