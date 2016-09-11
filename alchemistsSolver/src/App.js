import React from 'react';
// import logo from './logo.svg';
import './App.css';

// var _ = require('lodash');

var Fact = React.createClass({
  render: function() {
    return <li>
      {this.props.index}: {this.props.item.text}
      <button onClick={this.props.deleteFact} value={this.props.index}>Delete</button>
    </li>
  }
});

var TodoList = React.createClass({
  render: function() {
    return <ul>{this.props.items.map((fact, factIndex) => <Fact key={factIndex} item={fact} index={factIndex} deleteFact={this.props.deleteFact}/>)}</ul>;
  }
});

var TodoApp = React.createClass({
  getInitialState: function() {
    return {factlist: [], text: ''};
  },
  onChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    this.setState({factlist: this.state.factlist.concat([{text: this.state.text, id: Date.now()}]), text: ""});
  },
  render: function() {
    return (
      <div>
        <h3>TODO</h3>
        <TodoList items={this.state.factlist} deleteFact={this.deleteFact}/>
        <form onSubmit={this.handleSubmit}>
          <input onChange={this.onChange} value={this.state.text} />
          <button>{'Add #' + (100)}</button>
        </form>
        <div>{this.computeStuff()}</div>
      </div>
    );
  },
  deleteFact: function(e) {
    this.state.factlist.splice(e.target.value, 1);
    this.setState({factlist: this.state.factlist, text: this.state.text});
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
