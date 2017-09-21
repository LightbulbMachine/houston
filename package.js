_RELEASE_VERSION = "2.0.7";

Package.describe({
  name: "houston:admin",
  summary: "A zero-config Meteor Admin",
  version: _RELEASE_VERSION,
  git: "https://github.com/gterrono/houston.git"
});

//////////////////////////////////////////////////////////////////
// NPM dependencies
//////////////////////////////////////////////////////////////////
Npm.depends({
  'react': '15.6.1',
  'react-dom': '15.6.1',
  'react-router': '3.0.5',
  'react-router-dom': '4.1.2',
});

Package.on_use(function(api) {
  api.versionsFrom('METEOR@1.0');

  //////////////////////////////////////////////////////////////////
  // Meteor-provided packages
  //////////////////////////////////////////////////////////////////
  api.use('deps@1.0.0', ['client', 'server']);
  api.use('coffeescript@1.0.0', ['client', 'server']);
  api.use('accounts-base@1.0.0', ['client', 'server']);  // ?optional
  api.use('accounts-password@1.0.0', ['client', 'server']);
  api.use('templating@1.0.0', 'client');  // ?optional
  api.use('check@1.0.0', ['client', 'server']);
  api.use('spacebars@1.0.0', 'client');
  api.use('underscore@1.0.4', ['client', 'server']);
  api.use('ecmascript@0.8.2', ['client', 'server']);
  api.use('session@1.1.7', 'client'); // TODO: use react state
  api.use('react-meteor-data', 'client');


  //////////////////////////////////////////////////////////////////
  // Third-party package dependencies
  //////////////////////////////////////////////////////////////////
  // api.use('iron:router@1.0.1', 'client');
  api.use('tmeasday:paginated-subscription@0.2.4', 'client');
  api.use('dburles:mongo-collection-instances@0.3.4', ['client', 'server']);

  //////////////////////////////////////////////////////////////////
  // internal files
  //////////////////////////////////////////////////////////////////
  // load html first, https://github.com/meteor/meteor/issues/282
  api.add_files([
    // views
    'client/admin_login.html', 'client/db_view.html',
    'client/collection_view.html', 'client/document_view.html',
    'client/admin_change_password.html', 'client/custom_template_view.html',
    // partials
    'client/partials/admin_nav.html',
    'client/partials/flash_message.html',
    'client/partials/custom_actions.html',
    // layout
    'client/master_layout.html',
    'client/third-party/collapse.js.html',
    'client/third-party/bootstrap.html',
    'client/style.css.html'
    ],
  'client');

  api.add_files(['lib/collections.js',
                 'lib/shared.js',
                 'lib/menu.js'],
                ['client', 'server']);
  api.mainModule('client/routes.js', 'client');
  api.add_files([
    // shared
    'client/lib/shared.js',
    // shared partials
    'client/partials/admin_nav.js',
    'client/partials/flash_message.js',
    'client/partials/custom_actions.js',
    // view logic
    'client/custom_template_view.js', 'client/admin_login.js',
    'client/collection_view.js', 'client/document_view.js',
    'client/admin_change_password.js', 'client/db_view.js',
    // router
    // 'client/routes.js'
    ],
  'client');

  api.add_files(['server/publications.js', 'server/exports.js', 'server/methods.js'], 'server');
});

// TODO: remove old .coffee files
