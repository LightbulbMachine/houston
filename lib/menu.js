// const root = typeof exports !== 'undefined' && exports !== null ? exports : this;
import Houston from '../imports/houston';

// if (! root.Houston) { root.Houston = {}; }

Houston.menu = function() {
  for (const item of arguments) {
    this.menu._add_menu_item(item);
  }
};

Houston.menu.dependency = new Deps.Dependency;

Houston.menu._menu_items = [];

Houston.menu._process_item = function(item) {
  if ((item.type !== 'link') && (item.type !== 'template')) {
    throw new Meteor.Error(400, `Can't recognize type: ${item}`);
  }

  if (item.type === 'link') {
    item.path = item.use;
  } else if (item.type === 'template') {
    item.path = `${Houston._ROOT_ROUTE}/actions/${item.use}`;
  }

  return item;
};

Houston.menu._get_menu_items = function() {
  this.dependency.depend();
  return this._menu_items.map((item) => this._process_item(item));
};

Houston.menu._add_menu_item = function(item) {
  this._menu_items.push(item);
  return this.dependency.changed();
};
