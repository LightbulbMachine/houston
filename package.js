_RELEASE_VERSION = "3.0.3";

Package.describe({
  name: "houston:admin",
  summary: "A zero-config Meteor Admin",
  version: _RELEASE_VERSION,
  git: "https://github.com/zzaacchh/houston.git"
});

//////////////////////////////////////////////////////////////////
// NPM dependencies
//////////////////////////////////////////////////////////////////
Npm.depends({
  'react': '15.6.1',
  'react-dom': '15.6.1',
  'react-router': '3.0.5',
  'react-router-dom': '4.1.2',
  'react-motion': '0.5.2',
  'react-collapse': '4.0.3',
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
  api.use('tmeasday:paginated-subscription@0.2.4', 'client');
  api.use('dburles:mongo-collection-instances@0.3.4', ['client', 'server']);

  //////////////////////////////////////////////////////////////////
  // internal files
  //////////////////////////////////////////////////////////////////
  // TODO: import these files in the mainModules
  api.add_files(['lib/collections.js',
                 'lib/shared.js',
                 'lib/menu.js'],
                ['client', 'server']);

  api.mainModule('server/index.js', 'server');
  api.mainModule('client/index.js', 'client');
});
