Template.collection_view.helpers
  headers: -> get_collection_view_fields()
  nonid_headers: -> get_collection_view_fields()[1..]
  collection_name: -> "#{Session.get('collection_name')}"
  document_url: -> "/admin/#{Session.get('collection_name')}/#{@_id}"
  document_id: -> @_id + ""
  num_of_records: ->
    get_current_collection().find().count() or "no"
  pluralize: -> 's' unless get_current_collection().find().count() == 1
  rows: ->
    sort_by = {}
    sort_by[Session.get('key')] = Session.get('sort_order')
    query = {}
    fill_query_with_regex = (session_key) ->
      return unless Session.get(session_key)?
      for key, val of Session.get(session_key)
        # From http://stackoverflow.com/questions/3115150/how-to-escape-regular-expression-special-characters-using-javascript#answer-9310752
        query[key] = $regex: val.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
    fill_query_with_regex('top_selector')
    fill_query_with_regex('field_selectors')
    get_current_collection()?.find(query, {sort: sort_by}).fetch()
  values_in_order: ->
    fields_in_order = _.pluck(get_collection_view_fields(), 'name')
    names_in_order = _.clone fields_in_order
    values = (lookup(@, field_name) for field_name in fields_in_order[1..])  # skip _id
    ({value, name} for [value, name] in _.zip values, names_in_order[1..])
  filter_value: ->
    if Session.get('top_selector') and Session.get('top_selector')[@name]
      Session.get('top_selector')[@name]
    else if Session.get('field_selectors') and Session.get('field_selectors')[@name]
      Session.get('field_selectors')[@name]
    else
      ''

get_current_collection = -> get_collection(Session.get('collection_name'))
get_collection_view_fields = -> get_fields(get_current_collection().find({}, limit: 50).fetch())

Template.collection_view.events
  "click a.home": (e) ->
    Meteor.go("/admin/")

  "click a.sort": (e) ->
      e.preventDefault()
      if (Session.get('key') == this.name)
        Session.set('sort_order', Session.get('sort_order') * - 1)
      else
        Session.set('key', this.name)
        Session.set('sort_order', 1)
  'keyup #filter_selector': (event) ->
    return unless event.keyCode is 13  # enter
    try
      selector_json = JSON.parse($('#filter_selector').val())
      Session.set('top_selector', selector_json)
    catch error
      Session.set('top_selector', {})
  'dblclick .collection-field': (e) ->
    $this = $(e.currentTarget)
    $this.removeClass('collection-field')
    $this.html "<input type='text' value='#{$this.text()}'>"
    $this.find('input').select()
    $this.find('input').on 'blur', ->
      updated_val = $this.find('input').val()
      $this.html updated_val
      $this.addClass('collection-field')
      id = $('td:first-child a', $this.parents('tr')).html()
      field_name = $this.data('field')
      update_dict = {}
      update_dict[field_name] = updated_val
      Meteor.call("admin_#{Session.get('collection_name')}_update",
        id, $set: update_dict)

  'keyup .column_filter': (e) ->
    field_selectors = {}
    $('.column_filter').each (idx, item) ->
      if item.value
        field_selectors[item.name] = item.value
    Session.set 'field_selectors', field_selectors

  'click .admin-delete-doc': (e) ->
    e.preventDefault()
    id = $(e.currentTarget).data('id')
    Meteor.call "admin_#{Session.get('collection_name')}_delete", id

  'click .admin-create-doc': (e) ->
    e.preventDefault()
    $create_row = $('#admin-create-row')
    new_doc = {}
    for field in $create_row.find('input[type="text"]')
      new_doc[field.name] = field.value
      field.value = ''
    Meteor.call "admin_#{Session.get('collection_name')}_insert", new_doc
