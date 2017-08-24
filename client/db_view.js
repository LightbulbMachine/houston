// TODO make it server side so filtering can scale
const filterCollections = (query, collections) => {
  if (query) {
    return _.filter(collections, c => (c.name).indexOf(query) > -1);
  } else {
    return collections;
  }
};

Template._houston_db_view.helpers({
  collections() { return this.collections; },
  filtered_collections() {
    return filterCollections(Houston._session('search'), this.collections.find().fetch());
  }
});

Template._houston_db_view.events({
  // trigger meteor session invalidation, definitely a hack
  "click #refresh"() { return window.location.reload(); },
  'keyup .houston-column-filter'(e) {
    return Houston._session('search', $("#search").val());
  }
});

Template._houston_db_view.rendered = function() {
  $("#search").val("");
  return $(window).unbind('scroll');
};
