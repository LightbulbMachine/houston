import React, { Component } from 'react';

export default class HoustonLink extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    const { href } = e.currentTarget;
    const path = href.replace(/^.*\/\/[^\/]+/, '');
    const { history } = this.props;
    history.push(path);
  }

  render() {
    const { href, id, className, target } = this.props;

    return target && target === 'blank' ?
      (
        <a href={href} id={id} className={className} target="_blank">
          {this.props.children}
        </a>
      ) :
      (
        <a href={href} id={id} className={className} onClick={this.handleClick}>
          {this.props.children}
        </a>
      );
  }
}
