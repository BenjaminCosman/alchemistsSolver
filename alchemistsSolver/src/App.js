import React from 'react';
// import logo from './logo.svg';
import './App.css';

import _ from 'lodash'

// This is what an Alchemical looks like:
// [1, 1, -1]

// Here are all of the Alchemicals:
var alchemicals = [
  [-1, +1, -1],
  [+1, -1, +1],
  [+1, -1, -1],
  [-1, +1, +1],
  [-1, -1, +1],
  [+1, +1, -1],
  [-1, -1, -1],
  [+1, +1, +1],
]

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
    return {factlist: [], text: '', worlds: permutator(alchemicals)};
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
    this.setState({factlist: removeAtIndex(this.state.factlist, parseInt(e.target.value, 10))});
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

// non-mutating
function removeAtIndex(arr, index) {
  return _.filter(arr, function(val, idx) {return idx !== index})
}

var ColorMapping = {
  0: "red",
  1: "green",
  2: "blue",
};

// var SignMapping = {
//   -1: "minus",
//   0: "neutral",
//   1: "plus",
// };

// Alchemical -> Alchemical -> Potion
function mix(alchemicalA, alchemicalB) {
  var mean = _.zipWith(alchemicalA, alchemicalB, function(a,b){return (a+b)/2})
  for (var index = 0; index < 3; index++) {
    if (mean[(index+1) % 3] !== 0)
      mean[index] = 0
  }

  return mean
}

function check(world, fact) {
  var alchemicalA = world[fact.ingredients[0]]
  var alchemicalB = world[fact.ingredients[1]]
  var result = mix(alchemicalA, alchemicalB)
  console.log(result)
  console.log(fact.possibleResults)
  return fact.possibleResults.find(function(arr) {
    return _.isEqual(arr, result)
  }) !== undefined
}

// http://stackoverflow.com/a/20871714/6036628
function permutator(inputArr) {
  var results = [];

  function permute(arr, memo) {
    var cur, memo = memo || [];

    for (var i = 0; i < arr.length; i++) {
      cur = arr.splice(i, 1);
      if (arr.length === 0) {
        results.push(memo.concat(cur));
      }
      permute(arr.slice(), memo.concat(cur));
      arr.splice(i, 0, cur[0]);
    }

    return results;
  }

  return permute(inputArr);
}


// ===== Unit tests =====

// Here is what a World looks like:
var exampleWorld = [
  [+1, -1, -1],
  [-1, +1, -1],
  [+1, -1, +1],
  [-1, +1, +1],
  [+1, +1, +1],
  [-1, -1, +1],
  [+1, +1, -1],
  [-1, -1, -1],
]

// This is what an Ingredient looks like:
var exampleIngredientA = 4
var exampleIngredientB = 5

// This is what a Potion looks like:
var examplePotionA = [0, 0, 1] // this is a blue+
var examplePotionB = [0, 0, 0] // this is soup

// This is what a Fact looks like:
// {
//   ingredients: [5, 7]
//   possibleResults: [0, 0, 1], [0, 1, 0]]
// }
// combining ingredient 5 and 7 make either a green+ or a blue+
var exampleFact = {
  ingredients: [exampleIngredientA, exampleIngredientB],
  possibleResults: [examplePotionA, examplePotionB]
}

console.log(check(exampleWorld, exampleFact))

export default TodoApp;
