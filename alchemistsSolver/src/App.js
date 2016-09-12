//TODO change to percents
//TODO add other views
//TODO add other fact types (periscope / beginner debunking)

// The expected number of bits of information from real science is
// -[1/7*lg(1/7) * 7]
// = 2.807 bits

// The expected number of bits of information from experimenting randomly on an adventurer is
// -[1/7*lg(1/7) + 2/7*lg(2/7) + 1/7*lg(1/7) + 3/7*lg(3/7)]
// = 1.842 bits

import React from 'react';
// import logo from './logo.svg';
import './App.css';

import _ from 'lodash'
import update from 'react-addons-update'
import PureRenderMixin from 'react-addons-pure-render-mixin';


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

var ingredients = [
  "Mushroom",
  "Fern",
  "Toad",
  "Birdclaw",
  "Flower",
  "Mandrake",
  "Scorion",
  "Feather",
]

var potions = {
  "Red+":   [+1, 0, 0],
  "Red-":   [-1, 0, 0],
  "Green+": [0, +1, 0],
  "Green-": [0, -1, 0],
  "Blue+":  [0, 0, +1],
  "Blue-":  [0, 0, -1],
  "Soup":   [0, 0, 0],
}

var Fact = React.createClass({
  mixins: [PureRenderMixin],

  render: function() {
    return <li>
      {this.props.index}: {JSON.stringify(this.props.item)}
      <button onClick={this.props.deleteFact} value={this.props.index}>Delete</button>
    </li>
  }
});

var FactList = React.createClass({
  mixins: [PureRenderMixin],

  render: function() {
    return <ul>{this.props.items.map((fact, factIndex) => <Fact key={factIndex} item={fact} index={factIndex} deleteFact={this.props.deleteFact}/>)}</ul>;
  }
});

var Ingredient = React.createClass({
  mixins: [PureRenderMixin],

  render: function() {
    return <div><input type="radio" name="ingredient" onChange={this.props.callback}/>{this.props.name}<br/></div>
  }
})

var Potion = React.createClass({
  mixins: [PureRenderMixin],

  render: function() {
    return <div><input type="checkbox" name="potion" onChange={this.props.callback}/>{this.props.name}<br/></div>
  }
})

var SheetCell = React.createClass({
  mixins: [PureRenderMixin],

  render: function() {
    return <td>{this.percentage()}</td>
  },
  percentage: function() {
    var worlds = _.filter(this.props.worlds, _.bind(function(world) {
      return _.isEqual(world[this.props.ingredientIndex], this.props.alchemical)
    }, this))
    return Math.round(100 * worlds.length / this.props.worlds.length, 0)
  }
})

var SheetRow = React.createClass({
  mixins: [PureRenderMixin],

  render: function() {
    return <tr>{ingredients.map((ingredient, index) => <SheetCell ingredientIndex={index} alchemical={this.props.alchemical} key={index} worlds={this.props.worlds}/>)}</tr>
  }
})

var AlchemistsSolverApp = React.createClass({
  mixins: [PureRenderMixin],

  getInitialState: function() {
    return {
      factlist: [],
      currentFact: this.makeNewFact(),
      worlds: permutator(alchemicals),
    }
  },
  makeNewFact: function() {
    return {
      ingredients: [0, 1],
      possibleResults: [false, false, false, false, false, false, false]
    }
  },
  handleSubmit: function(e) {
    e.preventDefault();
    this.setState({
      factlist: this.state.factlist.concat([this.state.currentFact]),
      worlds: _.filter(this.state.worlds, _.curry(check)(this.state.currentFact)),
    });
  },
  ingredientChange: function(ingredientIndex, ingredient) {
    var newIngredients = [];
    newIngredients[ingredientIndex] = ingredient;
    var newState = update(this.state,
      {currentFact: {ingredients: {$merge: newIngredients}}})
    this.setState(newState)
  },
  potionChange: function(potionIndex) {
    var newPossibleResults = [];
    newPossibleResults[potionIndex] = !this.state.currentFact.possibleResults[potionIndex];
    var newState = update(this.state,
      {currentFact: {possibleResults: {$merge: newPossibleResults}}})
    this.setState(newState)
  },
  render: function() {
    var self = this;
    return (
      <div>
        <h3>Alchemists Solver</h3>
        <FactList items={this.state.factlist} deleteFact={this.deleteFact}/>

        <form action="" style={{display: "inline-block"}}>
          {ingredients.map((name, index) => <Ingredient name={name} ingredientNumber={0} key={index} callback={function() {self.ingredientChange(0, index)}} />)}
        </form>

        <form action="" style={{display: "inline-block"}}>
          {ingredients.map((name, index) => <Ingredient name={name} ingredientNumber={1} key={index} callback={function() {self.ingredientChange(1, index)}} />)}
        </form>

        <form action="" style={{display: "inline-block"}}>
          {_.keys(potions).map((name, index) => <Potion name={name} key={index} callback={function() {self.potionChange(index)}} />)}
        </form>

        <form onSubmit={this.handleSubmit}>
          <button>{'Add Fact'}</button>
        </form>

        <div>{this.computeStuff()}</div>

        <table>
          <tbody>
            {alchemicals.map((alchemical, index) => <SheetRow alchemical={alchemical} key={index} worlds={this.state.worlds}/>)}
          </tbody>
        </table>
      </div>
    );
  },
  deleteFact: function(e) {
    var newFactList = removeAtIndex(this.state.factlist, parseInt(e.target.value, 10))
    var worlds = permutator(alchemicals)
    for (var factIndex in newFactList) {
      var fact = newFactList[factIndex]
      console.log(fact)
      worlds = _.filter(worlds, _.curry(check)(fact))
    }
    this.setState({factlist: newFactList, worlds: worlds})
  },
  computeStuff: function() {
    return this.state.worlds.length
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

function check(fact, world) {
  var alchemicalA = world[fact.ingredients[0]]
  var alchemicalB = world[fact.ingredients[1]]
  var result = mix(alchemicalA, alchemicalB)
  var potionIndex = _.findIndex(_.values(potions), _.curry(_.isEqual)(result))
  return fact.possibleResults[potionIndex]
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
//   possibleResults: [true, false, false, false, false, false, true]
// }
// combining ingredient 5 and 7 make either a red+ or a soup
var exampleFact = {
  ingredients: [exampleIngredientA, exampleIngredientB],
  possibleResults: [examplePotionA, examplePotionB]
}

console.log(check(exampleFact, exampleWorld))

export default AlchemistsSolverApp;
