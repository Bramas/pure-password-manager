
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import config from './config';


class DebounceComponent extends Component {
  constructor() {
    super();
    this.state = {
      values: null,
      result: null,
      working: false
    };
  }
  valuesEquals(values) {
    return JSON.stringify(values)
      === JSON.stringify(this.props.values);
  }
  handleResult(values, result) {
    console.log('handleResult', values, result);

    if(!this.valuesEquals(values))
    {
      console.log('restart');
      this.startComputation(this.props.values);
      return;
    }
    this.setState({working: false});
    if(this.props.onChange) this.props.onChange(result);
    this.setState({result});
    this.forceUpdate();
  }
  onError(error, values) {
    this.setState({working: false});
    if(this.props.onError)
      this.props.onError(error, values);
    else
      console.error(error, {values});

    this.forceUpdate();
  }
  startComputation(values) {
    console.log('startComputation', values);
    this.setState({values});
    if(!this.state.working) {
      this.setState({working: true});
      this.forceUpdate();
    }
    this.props.compute(values)
      .then(this.handleResult.bind(this, values))
      .catch(this.onError.bind(this, values));
  }
  handleTimeout(values) {
    console.log('handleTimeout', values, this.valuesEquals(values))
    if(!this.valuesEquals(values))
    {
      return;
    }
    this.startComputation(values);
  }
  planUpdate(values) {
    this.setState({
      values
    });
    console.log('planUpdate', values, this.state.working)
    if(this.state.working) {
      return;
    }
    setTimeout(
      this.handleTimeout.bind(this, values),
      this.props.delay);
  }
  componentWillReceiveProps(nextProps) {
    if(!this.valuesEquals(nextProps.values))
    {
      this.planUpdate(nextProps.values);
    }
  }
  componentDidMount() {
    this.startComputation(this.props.values);
  }
  shouldComponentUpdate() {
    return false;
  }
  render() {
    return <this.props.component
    working={this.state.working}
    values={this.state.values}
    result={this.state.result}
    {...this.props.props} />
  }
}

export default DebounceComponent;
