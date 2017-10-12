import { objectifyDocumentId } from './documentId';

const setup_collection = function(collection_name, document_id) {
  const subscription_name = Houston._houstonize(collection_name);
  const filter = (() => {
    if (document_id) {
      return { _id: objectifyDocumentId(document_id) };
    }
    return {};
  })();

  return Houston._paginated_subscription =
    Meteor.subscribeWithPagination(subscription_name, {}, filter,
      Houston._page_length);
};

export { setup_collection };
