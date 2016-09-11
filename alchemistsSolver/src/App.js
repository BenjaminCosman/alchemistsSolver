import React from 'react';
// import logo from './logo.svg';
import './App.css';

var _ = require('lodash');

var TodoList = React.createClass({
  render: function() {
    var createItem = function(item) {
      return <li key={item.id}>{item.text}</li>;
    };
    return <ul>{this.props.experiments.map(createItem)}</ul>;
  }
});

var TodoApp = React.createClass({
  getInitialState: function() {
    return {experiments: [], text: ''};
  },
  onChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var nextexperiments = this.state.experiments.concat([{text: this.state.text, id: Date.now()}]);
    var nextText = '';
    this.setState({experiments: nextexperiments, text: nextText});
  },
  render: function() {
    return (
      <div>
        <h3>TODO</h3>
        <TodoList experiments={this.state.experiments} />
        <form onSubmit={this.handleSubmit}>
          <input onChange={this.onChange} value={this.state.text} />
          <button>{'Add #' + (this.state.experiments.length + 1)}</button>
        </form>
        <div>{this.computeStuff()}</div>
      </div>
    );
  },
  computeStuff: function() {
    var options = ["hi", "yo", "sup"];
    for (var i = 0; i < this.state.experiments.length; i++) {
      var experiment = this.state.experiments[i];
      console.log(experiment);
      options = _.difference(options, [experiment.text]);
    }
    return options;
  }
});

export default TodoApp;
