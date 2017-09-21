import React, { Component } from 'react';
import Houston from '../../../client/lib/shared';

export default class houston_flash_message extends Component {
  constructor(props) {
    super(props);
    this.err = this.err.bind(this);
    this.show = this.show.bind(this);
    this.message = this.message.bind(this);
    this.getClassName = this.getClassName.bind(this);
  }

  err() { return Houston._session('flash_error'); }
  show() { return Houston._session('flash_show'); }
  message() { return Houston._session('flash_message'); }

  getClassName() {
    const danger = this.err() ? 'danger' : 'success';
    const show = this.show() ? ' up' : '';
    return `alert-${danger}${show}`;
  }

  render() {
    return (
      <div id="flash-message" className={this.getClassName()}>
        {this.message()}
      </div>
    );
  }
}
