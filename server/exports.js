/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * DS208: Avoid top-level this
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Functions that Houston makes available to the app
// const root = typeof exports !== 'undefined' && exports !== null ? exports : this;
import Houston from '../imports/houston';

// Let Houston know about a collection manually, as an alternative
// to the current autodiscovery process
Houston.add_collection = collection =>
  // TODO options arg can be used to configure admin UI like Django does
  Houston._setup_collection(collection)
;

// Hide a collection that is not wanted in Houston
Houston.hide_collection = function(collection) {
  Houston._HIDDEN_COLLECTIONS[collection._name] = collection;
  const col = Houston._collections.collections.findOne({name: collection._name});
  if (col != null) { return Houston._collections.collections.remove(col); }
};

export { Houston };
