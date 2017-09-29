import { Session } from 'meteor/session';
import Houston from '../../imports/houston';

Houston._admin_user_exists = () => Houston._admins.find().count() > 0;

Houston.becomeAdmin = (cb) =>
  Houston._call('make_admin', Meteor.userId(), () => {
    Houston._subscribe_to_collections(); // resubscribe so you get them
    cb();
    // Houston._go('home');
    // location.reload();
  })
;

Houston._subscribe_to_collections = function() {
  if (Houston._collections_sub != null) { Houston._collections_sub.stop(); }
  Houston._collections_sub = Houston._subscribe('collections');
};

Handlebars.registerHelper('currentUserIsAdmin', () => Houston._user_is_admin(Meteor.userId()));

Handlebars.registerHelper('adminUserExists', Houston._admin_user_exists);

if (Houston._collections == null) { Houston._collections = {}; }

// regardless of what version of meteor we are using,
// get the right LocalCollection
Houston._get_collection = function(collection_name) {
  Houston._collections[collection_name] =
    Meteor.connection._mongo_livedata_collections[collection_name] ||
    new Meteor.Collection(collection_name);
  return Houston._collections[collection_name];
};

Houston._session = function() {
  const key = Houston._houstonize(arguments[0]);
  if (arguments.length === 1) {
    return Session.get(key);
  } else if (arguments.length === 2) {
    Session.set(key, arguments[1]);
  }
};

Houston._call = (name, ...args) => Meteor.call(Houston._houstonize(name), ...args);

Houston._nested_field_lookup = function(object, path) {
  if (object == null) { return ''; }
  if ((path ==='_id')&& (typeof object._id === 'object')) { return object._id._str; }
  let result = object;

  for (let part of path.split(".")) {
    result = result[part];
    if (result == null) { return ''; }
  }  // quit if you can't find anything here

  // Return date objects and other non-object types
  if ((typeof result !== 'object') || result instanceof Date) {
    return result;
  } else {
    return '';
  }
};

Houston._convert_to_correct_type = function(field, val, collection) {
  const find_obj = {};
  find_obj[field] = {$exists: true};
  const sample_val = Houston._nested_field_lookup(collection.findOne(find_obj), field);
  const { constructor } = sample_val;
  if (typeof sample_val === 'object') {
    return new constructor(val);
  } else if (typeof sample_val === 'boolean') {
    return val === 'true';
  } else {
    return constructor(val);
  }
};

Houston._get_type = function(field, collection) {
  const find_obj = {};
  find_obj[field] =
    {$exists: true};
  const sample_val = Houston._nested_field_lookup(collection.findOne(find_obj), field);
  return typeof sample_val;
};

export default Houston;
