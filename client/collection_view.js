/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const get_sort_by = function() {
  const sort_by = {};
  sort_by[Houston._session('sort_key')] = Houston._session('sort_order');
  return sort_by;
};

const get_filter_query = function(collection) {
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

const resubscribe = function(name) {
  // Stop the old subscription and resubscribe with the new filter/sort
  const subscription_name = `_houston_${name}`;
  Houston._paginated_subscription.stop();
  return Houston._paginated_subscription =
    Meteor.subscribeWithPagination(subscription_name,
      get_sort_by(), get_filter_query(Houston._get_collection(name)),
      Houston._page_length);
};

const collection_info = name => Houston._collections.collections.findOne({name});

const collection_count = name => {
  const collectionInfo = collection_info(name);
  if (collectionInfo && collectionInfo.count) {
    return collectionInfo.count;
  }
}

Template._houston_collection_view.helpers({
  collection_info() { return collection_info(this.collection); },
  custom_selector_error_class() { if (Houston._session("custom_selector_error")) { return "error"; } else { return ""; } },
  custom_selector_error() { return Houston._session("custom_selector_error"); },
  field_filter_disabled() { if (Houston._session("custom_selector")) { return "disabled"; } else { return ""; } },
  headers() { return get_collection_view_fields(this.name); },
  nonid_headers() { return get_collection_view_fields(this.name).slice(1); },
  document_id() { return this._id + ""; },
  num_of_records() { return collection_count(this.name) || "no"; },
  pluralize() { if (collection_count(this.name) !== 1) { return 's'; } },
  rows() {
    const collection = this.name;
    const documents = this != null ? this.find(get_filter_query(Houston._get_collection(collection)), {sort: get_sort_by()}).fetch() : undefined;
    return _.map(documents, function(d) {
      d.collection = collection;
      d._id = d._id._str || d._id;
      return d;
    });
  },
  values_in_order() {
    const fields_in_order = get_collection_view_fields(this.collection);
    const names_in_order = _.clone(fields_in_order);
    const values = (fields_in_order.slice(1).map((field) => Houston._nested_field_lookup(this, field.name)));  // skip _id
    return ((() => {
      const result = [];
      for (let [field_value, {name:field_name}] of _.zip(values, names_in_order.slice(1))) {
        result.push({field_value: field_value.toString(), field_name, collection: this.collection});
      }
      return result;
    })());
  },
  filter_value() {
    if (Houston._session('field_selectors') && Houston._session('field_selectors')[this]) {
      return Houston._session('field_selectors')[this];
    } else {
      return '';
    }
  }
});

Template._houston_collection_view.rendered = function() {
  const $win = $(window);
  const collection_name = this.data.name;
  resubscribe(collection_name);
  return $win.scroll(function() {
    if ((($win.scrollTop() + 300) > ($(document).height() - $win.height())) &&
      (Houston._paginated_subscription.limit() < collection_count(collection_name))) {
        return Houston._paginated_subscription.loadNextPage();
      }
  });
};

var get_collection_view_fields = name => {
  const collectionInfo = collection_info(name);
  if (collectionInfo && collectionInfo.fields) {
    return _.map(collectionInfo.fields, (obj) => {
      obj.collection_name = name;
      return obj;
    }) || []
  }
}
;

Template._houston_collection_view.events({
  "click a.houston-sort"(e) {
      e.preventDefault();
      const sort_key = this.name;
      if (Houston._session('sort_key') === sort_key) {
        Houston._session('sort_order', Houston._session('sort_order') * - 1);
      } else {
        Houston._session('sort_key', sort_key);
        Houston._session('sort_order', 1);
      }
      return resubscribe(this.collection_name);
    },

  'dblclick .houston-collection-field'(e) {
    const $this = $(e.currentTarget);
    const collection_name = this.collection;
    const collection = Houston._get_collection(collection_name);
    let field_name = $this.data('field');
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
        return Houston._call(`${collection_name}_update`,
          document_id, {$set: update_dict});
      }
    });
  },

  'keyup .houston-column-filter'(e) {
    const field_selectors = {};
    $('.houston-column-filter').each(function() {
      if (this.value) {
        return field_selectors[this.dataset.id] = this.value;
      }
    });
    Houston._session('field_selectors', field_selectors);
    return resubscribe(this.collection_name);
  },

  'click #expand-filter'(e) {
    e.preventDefault();
    // let the expand/collapse happen first
    return setTimeout((() => $('.houston-column-filter').first().focus()), 0);
  },

  'click #houston-custom-filter-btn, keydown #houston-custom-filter'(event) {
    // apply custom filter both on button click and on 'enter' in textarea
    if (event.type === "keydown") {
      if (event.keyCode !== 13) { return; }
      // shift-enter does a normal "newline"
      if ((event.keyCode === 13) && event.shiftKey) { return; }

      // enter without shift = trigger update, so don't add enter
      event.preventDefault();
    }
    try {
      const selector_text = $('#houston-custom-filter').val();
      if (selector_text === "") {
        Houston._session('custom_selector', null);
      } else {
        const selector_json = JSON.parse(selector_text);
        Houston._session('custom_selector', selector_json);
      }
      Houston._session('custom_selector_error', null);
      // successful, update, so lose focus on text
      event.currentTarget.blur();
    } catch (e) {
      Houston._session('custom_selector_error', e.toString());
      Houston._session('custom_selector', null);
    }
    return resubscribe(this.collection_name);
  },

  'click #houston-create-btn'() {
    $('#houston-create-document').removeClass('hidden');
    return $('#houston-create-btn').hide();
  },

  'click .houston-delete-doc'(e) {
    e.preventDefault();
    const id = $(e.currentTarget).data('id');
    if (confirm(`Are you sure you want to delete the document with _id ${id}?`)) {
      return Houston._call(`${this.collection}_delete`, id);
    }
  },

  'click .houston-delete-all'(e) {
    e.preventDefault();
    const name = $(e.currentTarget).data('name');
    if (confirm(`Are you sure you want to delete all the ${name}?`)) {
      return Houston._call(`${name}_deleteAll`);
    }
  },

  'click #houston-cancel'() {
    $('#houston-create-document').addClass('hidden');
    $('#houston-create-btn').show();
    return $('#houston-create-row .houston-field').each(function() {
      return $(this).val('');
    });
  },

  'click #houston-add'(e) {
    e.preventDefault();
    const collection = Houston._get_collection(this.name);
    const $create_row = $('#houston-create-row');
    const $fields = $create_row.find('.houston-field');
    const new_doc = {};
    _.each($fields, function(field){
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
    return Houston._call(`${this.name}_insert`, new_doc);
  },

  'submit form.houston-filter-form'(e) {
    return e.preventDefault();
  }
});

Template._houston_new_document_field.helpers({
  field_is_id() { return this.name === '_id'; },
  document_id() { return Houston._session('document_id'); },
  has_type() { return (Houston._INPUT_TYPES[this.type] != null); },
  input_type() { return Houston._INPUT_TYPES[this.type]; }
});
