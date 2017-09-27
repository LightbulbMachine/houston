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

export { setup_collection };
