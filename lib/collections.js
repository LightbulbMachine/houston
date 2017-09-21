// const root = typeof exports !== 'undefined' && exports !== null ? exports : this;
import Houston from '../imports/houston';

if (! Houston._collections) { Houston._collections = {}; }

Houston._collections.collections = new Meteor.Collection('houston_collections');

Houston._admins = new Meteor.Collection('houston_admins');

// TODO: Handle user roles:
Houston._user_is_admin = id => true; //id && Roles.userIsInRole(id, ['admin']);
