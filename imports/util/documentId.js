const objectifyDocumentId = documentId => {
  // Sometimes you can lookup with _id being a string, sometimes not
  // When id can be wrapped in an ObjectID, it should
  // It can't if it isn't 12 bytes (24 characters)
  if ((typeof(documentId) === 'string') && (documentId.length === 24)) {
    return new Meteor.Collection.ObjectID(documentId);
  }

  return documentId;
};

export { objectifyDocumentId };
