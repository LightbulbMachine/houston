import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { withRouter, Link } from 'react-router-dom';
import HoustonLink from './link';
import Houston from '../../../client/lib/shared';

class HoustonCustomActions extends Component {
  constructor(props) {
    super(props);
    this.renderActions = this.renderActions.bind(this);
    this.handleCustomAction = this.handleCustomAction.bind(this);
  }

  handleCustomAction(e) {
    e.preventDefault();
    const { collection_info, doc, callback } = this.props;
    const action = e.currentTarget.dataset.action;

    return Meteor.call(Houston._custom_method_name(collection_info.name, action), doc, () => {
      Houston._show_flash();
      callback && callback();
    });
  }

  renderActions() {
    const { actions, size, history } = this.props;

    return actions.map( action =>
      <div className={`btn btn-${size} btn-default custom-houston-action`}
           data-action={action}
           key={action}
           onClick={this.handleCustomAction}>
        {action}
      </div> );
  }

  render() {
    return (
      <div>
        {this.renderActions()}
      </div>
    );
  }
}

const HoustonCustomActionsWithData = createContainer((props) => {
  const { collection_info } = props;
  const actions = collection_info && collection_info.method_names || [];

  return {
    actions,
  };
}, HoustonCustomActions);

export default withRouter(HoustonCustomActionsWithData);
