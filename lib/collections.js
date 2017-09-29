import Houston from '../imports/houston';

if (! Houston._collections) { Houston._collections = {}; }

Houston._collections.collections = new Meteor.Collection('houston_collections');

Houston._admins = new Meteor.Collection('houston_admins');

Houston._user_is_admin = id => id && Roles.userIsInRole(id, ['admin']);
