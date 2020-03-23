
import React, { Component } from 'react';


export default (options) => (DecoratedComponent) => {

  return class DebounceComponent extends Component {
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
        === JSON.stringify(this.props);
    }
    isWorking() {
      return this.state.working;
    }
    handleResult(values, result) {
      console.debug('handleResult', values, result);

      if(!this.valuesEquals(values))
      {
        console.debug('restart');
        this.startComputation(this.props);
        return;
      }
      this.setState({working: false});
      if(this.props.onStateChanged) this.props.onStateChanged('ready');
      if(this.props.onChange) this.props.onChange(result);
      this.setState({result});
      this.forceUpdate();
    }
    onError(error, values) {
      this.setState({working: false});
      if(this.props.onStateChanged) this.props.onStateChanged('ready');
      if(this.props.onError)
        this.props.onError(error, values);
      else
        console.error(error, {values});

      this.forceUpdate();
    }
    startComputation(values) {
      console.debug('startComputation', values);
      this.setState({
        values,
        result: null
      });
      if(!this.state.working) {
        this.setState({working: true});
        if(this.props.onStateChanged) this.props.onStateChanged('working');
        this.forceUpdate();
      }
      options.compute(values)
        .then(this.handleResult.bind(this, values))
        .catch(this.onError.bind(this, values));
    }
    handleTimeout(values) {
      console.debug('handleTimeout', values, this.valuesEquals(values))
      if(!this.valuesEquals(values))
      {
        return;
      }
      this.startComputation(values);
    }
    planUpdate(values) {
      this.setState({
        values,
        result: null
      });
      console.debug('planUpdate', values, this.state.working)
      if(this.state.working) {
        return;
      }
      setTimeout(
        this.handleTimeout.bind(this, values),
        options.delay);
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
      if(!this.valuesEquals(nextProps))
      {
        this.planUpdate(nextProps);
      }
    }
    componentDidMount() {
      this.startComputation(this.props);
    }
    shouldComponentUpdate() {
      return false;
    }
    render() {
      return <DecoratedComponent
      {...this.state.values}
      working={this.state.working}
      result={this.state.result}
      {...this.props.props} />
    }
  }
};
