Template._houston_custom_actions.helpers({
  actions() {
    if (this.collection_info.method_names) {
      return (this.collection_info.method_names.map((action) => _.extend({action}, this)));
    }
  }
});
Template._houston_custom_actions.events({
  'click .custom-houston-action'(e) {
    e.preventDefault();
    return Meteor.call(Houston._custom_method_name(this.collection_info.name, this.action), this.document, Houston._show_flash);
  }
});

