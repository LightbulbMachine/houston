// const root = typeof exports !== 'undefined' && exports !== null ? exports : this;
import Houston from '../imports/houston';

// if (root.Houston == null) { root.Houston = {}; }

Houston._houstonize = name => `_houston_${name}`;

Houston._custom_method_name = (collection_name, method_name) => Houston._houstonize(`${collection_name}/${method_name}`);

// change _MAX_DOCS_TO_EXPLORE if you need us to explore more docs
Houston._MAX_DOCS_TO_EXPLORE = 100;

Houston._get_fields_from_collection = collection =>
  // TODO(AMK) randomly sample the documents in question
  Houston._get_fields(collection.find().fetch())
;

Houston._get_fields = function(documents, options) {
  if (! options) { options = {}; }
  const key_to_type = (options.exclude_id) ? {} : {_id: 'ObjectId'};

  const find_fields = function(doc, prefix) {
    if (! prefix) { prefix = ''; }
    const object = _.omit(doc, '_id');

    _.each(object, function(value, key){
      var full_path_key;
      if (typeof value === 'object') {

        // handle dates like strings
        if (value instanceof Date) {
          full_path_key = `${prefix}${key}`;
          key_to_type[full_path_key] = "Date";
        // recurse into sub documents
        } else {
          find_fields(value, `${prefix}${key}.`);
        }
      } else if (typeof value !== 'function') {
        full_path_key = `${prefix}${key}`;
        key_to_type[full_path_key] = typeof value;
      }
    });
  };

  _.each(documents.slice(0, Houston._MAX_DOCS_TO_EXPLORE), (doc) => {
    find_fields(doc);
  });

  return _.map(key_to_type, (value, key) => {
    return {name: key, type: value};
  });
};

Houston._get_field_names = documents => _.pluck(Houston._get_fields(documents), 'name');
