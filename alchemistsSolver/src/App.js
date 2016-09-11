import React from 'react';
// import logo from './logo.svg';
import './App.css';

// var _ = require('lodash');

var Fact = React.createClass({
  render: function() {
    return <li key={this.props.item.id}>{this.props.item.text}</li>
  }
})

var TodoList = React.createClass({
  getInitialState: function() {
    return {facts: []}
  },
  addFact: function(fact) {
    this.setState({facts: this.state.facts.concat([fact])});
  },
  render: function() {
    var createItem = function(item) {
      return item;
    };
    return <ul>{this.state.facts}</ul>;
  }
});

var TodoApp = React.createClass({
  getInitialState: function() {
    // var foo = React.createElement(TodoList);
    // console.log(foo);
    // foo.addFact(null);
    return {factlist: React.createElement(TodoList), text: ''};
  },
  onChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    console.log(this.state.factlist);
    var nextfacts = this.state.factlist.addFact(React.createElement(Fact, {text: this.state.text, id: Date.now()}));
    var nextText = '';
    this.setState({factlist: nextfacts, text: nextText});
  },
  render: function() {
    return (
      <div>
        <h3>TODO</h3>
        {this.state.factlist}
        <form onSubmit={this.handleSubmit}>
          <input onChange={this.onChange} value={this.state.text} />
          <button>{'Add #' + (100)}</button>
        </form>
        <div>{this.computeStuff()}</div>
      </div>
    );
  },
  computeStuff: function() {
    // var options = ["hi", "yo", "sup"];
    // for (var i = 0; i < this.state.facts.length; i++) {
    //   var fact = this.state.facts[i];
    //   console.log(fact);
    //   options = _.difference(options, [fact.text]);
    // }
    // return options;
    return 3;
  }
});

export default TodoApp;
