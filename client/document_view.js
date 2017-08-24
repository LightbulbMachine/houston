Template._houston_document_view.helpers({
  collection_info() {
    return Houston._collections.collections.findOne({name: this.name});
  },
  showSaved() {
    return Houston._session('show_saved');
  },
  fields() {
    const fields = Houston._get_fields([this.document], {exclude_id: true});
    const result = [];
    for (let field of fields) {
      const value = Houston._nested_field_lookup(this.document, field.name);
      result.push({name: `${field.name} (${typeof value})`, name_id: field.name, type: typeof value, value: value.toString()});
    }
    return result;
  },
  document_id() {
    return this.document._id;
  }
});

Template._houston_document_field.helpers({
  has_type() { return (Houston._INPUT_TYPES[this.type] != null); },
  input_type() { return Houston._INPUT_TYPES[this.type]; }});

Template._houston_document_view.events({
  'click #houston-save'(e) {
    e.preventDefault();
    const col = this.collection;
    const update_dict = {};
    _.each($('.houston-field'), function(field){
      const field_name = field.name.split(' ')[0];
      if (field_name !== '_id') {
        update_dict[field_name] = Houston._convert_to_correct_type(field_name, field.value, col);
      }
    });
    Houston._call(`${this.name}_update`, this.document._id, {$set: update_dict}, Houston._show_flash);
  },

  'click #houston-delete'(e) {
    e.preventDefault();
    const id = this.document._id;
    if (confirm(`Are you sure you want to delete the document with _id ${id}?`)) {
      Houston._call(`${this.name}_delete`, id);
      Houston._go('collection', { collection_name: this.name });
    }
  }
});

Template._houston_document_view.rendered = () => $(window).unbind('scroll');
