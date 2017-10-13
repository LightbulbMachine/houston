import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router-dom';
import { Collapse } from 'react-collapse';
import { setup_collection } from '../../util/subs';
import HoustonLink from '../partials/link';
import Houston from '../../../client/lib/shared';

class houston_collection_view extends Component {
  constructor(props) {
    super(props);

    this.state = {
      collapseOpened: false,
      docFormHidden: true,
      newButtonHidden: false,
    };

    this.num_of_records = this.num_of_records.bind(this);
    this.handleCollapse = this.handleCollapse.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
    this.handleSort = this.handleSort.bind(this);
    this.handleInlineEdit = this.handleInlineEdit.bind(this);
    this.handleNew = this.handleNew.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleDeleteAll = this.handleDeleteAll.bind(this);
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

  handleCollapse(e) {
    e.preventDefault();
    this.setState({ collapseOpened: ! this.state.collapseOpened });
    // let the expand/collapse happen first (TODO: replace with non-jquery code)
    return setTimeout((() => $('.houston-column-filter').first().focus()), 0);
  }

  handleFilter(e) {
    const { name, resubscribe, sort_by, filter_query } = this.props;
    const field_selectors = {};
    // TODO: find react solution
    $('.houston-column-filter').each(function() {
      if (this.value) {
        return field_selectors[this.dataset.id] = this.value;
      }
    });
    Houston._session('field_selectors', field_selectors);
    resubscribe(name, sort_by, filter_query);
  }

  handleSort(e) {
    e.preventDefault();
    const { name, resubscribe, sort_by, filter_query, rows } = this.props;
    const sort_key = e.currentTarget.dataset.name;
    if (Houston._session('sort_key') === sort_key) {
      Houston._session('sort_order', Houston._session('sort_order') * - 1);
    } else {
      Houston._session('sort_key', sort_key);
      Houston._session('sort_order', 1);
    }

    resubscribe(name, sort_by, filter_query);
  }

  handleInlineEdit(e) {
    // TODO: completeley rewrite this method to leverage react
    // instead of using jquery and manipulating the DOM
    const { name, collection } = this.props;
    const target = e.currentTarget;
    const $this = $(target);
    let field_name = target.dataset.field;
    const type = Houston._get_type(field_name, collection);
    const input = 'text'; // TODO schemaToInputType type fix on blur bug
    let old_val = $this.text().trim();
    
    $this.removeClass('houston-collection-field');
    $this.html(`<input type='${input}' class='input-sm form-control' placeholder='${type}' value='${old_val}'>`);
    old_val = Houston._convert_to_correct_type(field_name, old_val,
        collection);
    $this.find('input').select();
    $this.find('input').on('keydown', function(event) {
      if (event.keyCode === 13) { return event.currentTarget.blur(); }
    });
    
    return $this.find('input').on('blur', function() {
      let updated_val = $this.find('input').val();
      $this.addClass('houston-collection-field');
      const document_id = $this[0].parentNode.dataset.id;
      field_name = $this.data('field');
      updated_val = Houston._convert_to_correct_type(field_name, updated_val,
        collection);
      const update_dict = {};
      update_dict[field_name] = updated_val;
      if (updated_val === old_val) {
        return $this.html(updated_val.toString());
      } else {
        $this.html('');
        return Houston._call(`${name}_update`,
          document_id, {$set: update_dict});
      }
    });
  }

  handleDelete(e) {
    e.preventDefault();
    const { name } = this.props;
    const id = e.currentTarget.dataset.id;
    if (confirm(`Are you sure you want to delete the document with _id ${id}?`)) {
      return Houston._call(`${name}_delete`, id);
    }
  }

  handleNew(e) {
    e.preventDefault();
    this.setState({ docFormHidden: false });
    this.setState({ newButtonHidden: true });
  }

  handleAdd(e) {
    e.preventDefault();
    const { name, collection, nonid_headers } = this.props;

    const new_doc = {};
    _.each(nonid_headers, (header) => {
      const field = this[Houston._houstonize(header.name)];
      // Unflatten the field names (e.g. foods.app -> {foods: {app:}})
      const keys = field.name.split('.');
      const final_key = keys.pop();

      const value = Houston._convert_to_correct_type(field.name, field.value,
        collection);
      let doc_iter = new_doc;
      for (let key of keys) {
        if (!doc_iter[key]) { doc_iter[key] = {}; }
        doc_iter = doc_iter[key];
      }

      doc_iter[final_key] = value;

      field.value = '';
    });
    
    console.log("new_doc", new_doc);
    return Houston._call(`${name}_insert`, new_doc);
  }

  handleCancel(e) {
    e.preventDefault();
    this.setState({ docFormHidden: true });
    this.setState({ newButtonHidden: false });
    document.getElementById("houston-create-row").reset();
  }

  handleDeleteAll(e) {
    e.preventDefault();
    const { name } = this.props;
    if (confirm(`Are you sure you want to delete all the ${name}?`)) {
      return Houston._call(`${name}_deleteAll`);
    }
  }

  renderNewDocumentFields() {
    const { nonid_headers } = this.props;

    return nonid_headers && nonid_headers.map( header =>
      <div className="form-group" key={header.name}>
        <label htmlFor={header.name} className="col-sm-4 control-label">{header.name}</label>

        <div className="col-sm-8">
          <textarea className="input-sm houston-field form-control"
                    placeholder={header.type}
                    name={header.name}
                    defaultValue={header.value}
                    ref={input => this[Houston._houstonize(header.name)] = input}></textarea>
        </div>

      </div>
    );
  }

  renderNonIdHeaders() {
    const { nonid_headers } = this.props;

    return nonid_headers && nonid_headers.map( header =>
      <div className="form-group col-xs-12 col-sm-6 col-md-4 col-lg-3" key={header.name}>
        <div className="input-group">
          <div className="input-sm input-group-addon">{header.name}</div>
          <input className="form-control houston-column-filter input-sm"
                 type="text" data-id={header.name}
                 placeholder={header.type}
                 value={header.filter_value}
                 onKeyUp={this.handleFilter} />
        </div>
      </div> );
  }

  renderHeaders() {
    const { headers } = this.props;

    return headers && headers.map( header =>
      <th key={header.name}><a href="#" className="houston-sort" onClick={this.handleSort} data-name={header.name}>{header.name}</a></th> );
  }

  renderValues(row) {
    const values_in_order = this.props.values_in_order(row);
    
    return values_in_order && values_in_order.map( value =>
      <td data-field={value.field_name} key={value.field_name} className='houston-collection-field' onDoubleClick={this.handleInlineEdit}>
        {value.field_value}
      </td> );
  }

  renderRows() {
    const { name, history, rows } = this.props;
    const sort_order = Houston._session('sort_order');

    return rows && rows.map( row =>
      <tr id={`ID_${sort_order}`} data-id={row._id} key={row._id}>
        <td><HoustonLink href={`${Houston._ROOT_ROUTE}/${name}/${row._id}`} history={history}><i
            className="fa fa-file"></i>{row._id}</HoustonLink></td>
        {this.renderValues(row)}
        <td className="action-cell" >
          {/*{> _houston_custom_actions collection_info=collection_info document=this size="xs" }*/}
          <div data-id={row._id}
               className="btn btn-xs houston-delete-doc btn-danger"
               onClick={this.handleDelete}>
            <i className="fa fa-trash-o"></i>Delete
          </div>
        </td>
      </tr> );
  }

  render() {
    const { name, history } = this.props;
    const { collapseOpened, docFormHidden, newButtonHidden } = this.state;

    return (
      <div>
        <ul className="breadcrumb">
          
          <li><HoustonLink href={Houston._ROOT_ROUTE} history={history} className="houston-home"><i
              className="fa fa-home"></i>Home</HoustonLink></li>
         <li className="active"><i className="fa fa-database"></i>{ name }</li>
        </ul>
        <div className={`row ${docFormHidden && 'hidden'}`} id="houston-create-document">
          <h3>Add more { name }</h3>

          <form id="houston-create-row" className="form-horizontal" role="form">
            {this.renderNewDocumentFields()}

            <div className="form-group">
              <div className="col-sm-12">
                <button type="button" id="houston-cancel" className="btn btn-primary" onClick={this.handleCancel}><i
                    className="fa fa-times"></i>Cancel
                </button>
                <button type="button" id="houston-add"
                        className="btn btn-success pull-right" onClick={this.handleAdd}><i className="fa fa-plus"></i>Add
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
                <button data-name={name} className="btn btn-sm houston-delete-all btn-danger" onClick={this.handleDeleteAll}>
                  <i className="fa fa-trash-o"></i>
                  Delete all
                </button>
                <button id="houston-create-btn" className={`btn btn-sm btn-success ${newButtonHidden && 'hidden'}`} onClick={this.handleNew}>
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
                     href="#collapseOne" onClick={this.handleCollapse}>
                    <h4><i className="fa fa-filter"></i>Filter&nbsp;<i
                        className="fa fa-caret-down"></i></h4>
                  </a>
                </div>
              </div>
              <Collapse isOpened={this.state.collapseOpened}>
                <div id="collapseOne" className="panel-collapse" style={{ minHeight: '30px' }}>
                  <form className="form-inline" role="form">
                    {this.renderNonIdHeaders()}
                  </form>
                </div>
              </Collapse>
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
  const filter_query = get_filter_query(collection);
  const sort_by = get_sort_by();
  const headers = get_collection_view_fields(collection_name, collection_info);
  const nonid_headers = headers && headers.slice(1);
  
  const rows = () => {
    const documents = collection.find(filter_query, { sort: sort_by }).fetch();

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

  const resubscribe = function(name, sort_by, filter_query) {
    // Stop the old subscription and resubscribe with the new filter/sort
    const subscription_name = Houston._houstonize(name);
    Houston._paginated_subscription.stop();
    return Houston._paginated_subscription =
      Meteor.subscribeWithPagination(subscription_name,
        sort_by, filter_query,
        Houston._page_length);
  };

  return {
    collection,
    collection_info,
    collection_count,
    filter_query,
    rows: rows(),
    sort_by,
    values_in_order,
    resubscribe,
    headers,
    nonid_headers,
    name: collection_name,
  };

}, houston_collection_view);

export default withRouter(houston_collection_view_with_data);
