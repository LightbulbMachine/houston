/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let name;
if (window.Houston == null) { window.Houston = {}; }

Houston._ROOT_ROUTE = __guard__(Meteor.settings != null ? Meteor.settings.public : undefined, x => x.houston_root_route) || "/admin";
Houston._page_length = __guard__(Meteor.settings != null ? Meteor.settings.public : undefined, x1 => x1.houston_documents_per_page) || 20;
Houston._subscribe = name => Meteor.subscribe(Houston._houstonize(name));

Houston._subscribe_to_collections();

const setup_collection = function(collection_name, document_id) {
  const subscription_name = Houston._houstonize(collection_name);
  const filter = (() => {
    if (document_id) {
    // Sometimes you can lookup with _id being a string, sometimes not
    // When id can be wrapped in an ObjectID, it should
    // It can't if it isn't 12 bytes (24 characters)
    if ((typeof(document_id) === 'string') && (document_id.length === 24)) {
      document_id = new Meteor.Collection.ObjectID(document_id);
    }
    return {_id: document_id};
  } else {
    return {};
  }
  })();
  return Houston._paginated_subscription =
    Meteor.subscribeWithPagination(subscription_name, {}, filter,
      Houston._page_length);
};

Houston._houstonize_route = name => Houston._houstonize(name).slice(1);

Houston._go = (route_name, options) => Router.go(Houston._houstonize_route(route_name), options);


const houston_route = (route_name, options) => {
  // Append _houston_ to template and route names to avoid clobbering parent route namespace
  options.layoutTemplate = '_houston_master_layout';
  options.name = Houston._houstonize_route(route_name);
  options.template = Houston._houstonize(options.template);
  options.waitOn = function() {
    const subscriptions = options.subs ? options.subs(this.params) : [];
    subscriptions.push(Houston._subscribe('admin_user'));
    return subscriptions;
  };
  return Router.route(`${Houston._ROOT_ROUTE}${options.houston_path}`, options);
};

houston_route('home', {
  houston_path: '/',
  template: 'db_view',
  data() { return {collections: Houston._collections.collections}; },
  waitOn() { return Houston._collections; }
}
);

houston_route('login', {
  houston_path: "/login",
  template: 'login'
}
);

houston_route('change_password', {
  houston_path: "/password",
  template: 'change_password'
}
);

houston_route('custom_template', {
  houston_path: "/actions/:template",
  template: 'custom_template_view',
  data() { return this.params; }
}
);

houston_route('collection', {
  houston_path: "/:collection_name",
  data() { return Houston._get_collection(this.params.collection_name); },
  subs(params) { return [setup_collection(params.collection_name)]; },
  template: 'collection_view'
}
);

houston_route('document', {
  houston_path: "/:collection/:_id",
  data() {
    this.subscription = setup_collection(this.params.collection, this.params._id);
    const collection = Houston._get_collection(this.params.collection);
    const document = collection.findOne({_id: this.params._id});
    return {document, collection, name: this.params.collection};
  },
  template: 'document_view'
}
);

// ########
// filters
// ########
const mustBeAdmin = function() {
  if (!Meteor.user()) {
    if (Meteor.loggingIn()) {
      return this.render('houstonLoading');
    } else {
      return Houston._go('login');
    }
  } else {
    if (this.ready() && !Houston._user_is_admin(Meteor.userId())) {
      return Houston._go('login');
    } else {
      return this.next();
    }
  }
};

// If the host app doesn't have a router, their html may show up
const hide_non_admin_stuff = function() {
  $('body').css('visibility', 'hidden').children().hide();
  $('body>.houston').show();
  return this.next();
};
const remove_host_css = function() {
  $('link[rel="stylesheet"]').remove();
  return this.next();
};

const BASE_HOUSTON_ROUTES = ((() => {
  const result = [];
  for (name of ['home', 'collection', 'document', 'change_password', 'custom_template']) {     result.push(Houston._houstonize_route(name));
  }
  return result;
})());
const ALL_HOUSTON_ROUTES = BASE_HOUSTON_ROUTES.concat([Houston._houstonize_route('login')]);
Router.onBeforeAction(mustBeAdmin, {only: BASE_HOUSTON_ROUTES});
Router.onBeforeAction(hide_non_admin_stuff, {only: ALL_HOUSTON_ROUTES});
Router.onBeforeAction(remove_host_css, {only: ALL_HOUSTON_ROUTES});

const { onRouteNotFound } = Router;
Router.onRouteNotFound = function(...args) {
  const non_houston_routes = _.filter(Router.routes, route => route.name.indexOf('houston_') !== 0);
  if (non_houston_routes.length > 0) {
    return onRouteNotFound.apply(Router, args);
  } else {
    return console.log("Note: Houston is suppressing Iron-Router errors because we don't think you are using it.");
  }
};

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}