// Top Nav
Template._houston_navbar.events({
  'click #houston-logout'(e) {
    e.preventDefault();
    Meteor.logout();
  },
});

Template._houston_navbar.helpers({
  'bugreport_url'() {
    const message = encodeURIComponent(`\
      To make sure we can help you quickly, please include the version of Houston
      you are using, steps to replicate the issue, a description of what you were
      expecting and a screenshot if relevant.

      Thanks!\
      `
    );
    return `https://github.com/gterrono/houston/issues/new?body=${message}`;
  },
  'menu_items'() {
    return Houston.menu._get_menu_items();
  },
  'isActive'() {
    const current = Router.current();
    return current && current.path === this.path ? 'active' : '';
  }
});

// Side Nav
Template._houston_sidenav.helpers({
  collections() {
    return Houston._collections.collections.find().fetch();
  },
  is_active(name) {
    return name === Houston._session('collection_name');
  }
});
