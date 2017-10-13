import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router-dom';
import { setup_collection } from '../../util/subs';
import { objectifyDocumentId } from '../../util/documentId';
import HoustonLink from '../partials/link';
import HoustonCustomActions from '../partials/custom_actions';
import Houston from '../../../client/lib/shared';

class houston_document_view extends Component {
  constructor(props) {
    super(props);
    this.handleSave = this.handleSave.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.renderFields = this.renderFields.bind(this);
    this.goBack = this.goBack.bind(this);
  }

  goBack() {
    const { name, history } = this.props;
    history.push(`${Houston._ROOT_ROUTE}/${name}`);
  }

  handleSave(e) {
    e.preventDefault();
    const { fieldNames, name, document_id } = this.props;

    const col = this.props.collection;
    const update_dict = {};
    _.each(fieldNames, (field_name) => {
      const field = this[Houston._houstonize(field_name)];
      if (field_name !== '_id') {
        update_dict[field_name] = Houston._convert_to_correct_type(field_name, field.value, col);
      }
    });

    Houston._call(`${name}_update`, document_id, { $set: update_dict }, Houston._show_flash);
  }

  handleDelete(e) {
    e.preventDefault();
    const { name, document_id, history } = this.props;

    if (confirm(`Are you sure you want to delete the document with _id ${document_id}?`)) {
      Houston._call(`${name}_delete`, document_id);
      history.push(`${Houston._ROOT_ROUTE}/${name}`);
    }
  }

  renderFields() {
    const { fields } = this.props;
    
    return fields && fields.map( field =>
      <div className="form-group" key={field.name_id}>
        <label htmlFor={field.name_id} className="col-sm-3 control-label">{field.name_id}</label>
        <div className="col-sm-9">
          <textarea
            className="houston-field form-control"
            name={field.name_id}
            defaultValue={field.value}
            ref={input => this[Houston._houstonize(field.name_id)] = input}>
          </textarea>
          <p className="help-block">Please enter a {field.type}</p>
        </div>
      </div> );
  }

  render() {
    const { name, doc, document_id, collection_info, loading, history } = this.props;

    return (
      <div>
        <ul className="breadcrumb">
          <li>
            <HoustonLink href={Houston._ROOT_ROUTE} history={history} className="houston-home"><i
              className="fa fa-home"></i>Home</HoustonLink>
          </li>
          <li>
            <HoustonLink href={`${Houston._ROOT_ROUTE}/${name}`} history={history} className="houston-collection"><i
              className="fa fa-database"></i>{name}</HoustonLink>
          </li>
          <li className="active"><i className="fa fa-file"></i>{document_id}</li>
        </ul>
        <h1>{name}
          <small>{document_id}</small>
        </h1>

        <form className="form-horizontal" role="form">
          {this.renderFields()}

          <div id="houston-doc-actions" className="form-group">
            <div className="col-sm-offset-3 col-sm-9">
              <HoustonLink href={`${Houston._ROOT_ROUTE}/${name}`} history={history} id="houston-back" className="btn btn-primary"><i
                  className="fa fa-reply"></i>Back
              </HoustonLink>
              <button type="button" id="houston-save" className="btn btn-success" onClick={this.handleSave}><i
                  className="fa fa-save"></i>Save
              </button>
              <button type="button" id="houston-delete"
                      className="btn btn-danger pull-right" onClick={this.handleDelete}><i
                  className="fa fa-trash-o"></i>Delete
              </button>
              <div className="pull-right">
                <HoustonCustomActions collection_info={collection_info} doc={doc} size="md" callback={this.goBack} />
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

const houston_document_view_with_data = createContainer(({ match }) => {
  const name = match.params.collection;
  const document_id = match.params._id;
  const sub = setup_collection(name, document_id);
  const loading = ! sub.ready();
  const collection = Houston._get_collection(name);
  const collection_info = Houston._collections.collections.findOne({ name });
  const doc = collection.findOne({ _id: objectifyDocumentId(document_id) });
  const fields = Houston._get_fields([doc], { exclude_id: true });

  return {
    name,
    document_id,
    doc,
    collection,
    collection_info,
    loading,
    fields: _.map(fields, (field) => {
      const value = Houston._nested_field_lookup(doc, field.name);
      return {
        name: `${field.name} (${typeof value})`,
        name_id: field.name,
        type: typeof value,
        value: value.toString(),
      };
    }),
    fieldNames: _.map(fields, (field) => {
      return field.name;
    }),
  };

}, houston_document_view);

export default withRouter(houston_document_view_with_data);
