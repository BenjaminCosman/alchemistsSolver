// === UI stuff ===
//TODO visualize the alchemicals in the row headers of the table
//TODO add pictures for the ingredients in the column headers of the table
//TODO add pictures for the ingredients in the radio buttons
//TODO add pictures of the potions for the check boxes
//TODO add refresh indicators http://www.material-ui.com/#/components/refresh-indicator
//TODO downsize columns (and rows)

// === Additional views ===
//TODO add view to see individual worlds when you have just a few
//TODO add view for best things to mix for the adventurer

// === Other stuff ===
//TODO add other fact types (periscope / beginner debunking
//TODO make the view match the state for the buttons etc.
//TODO fix lag issues
//TODO move tests into the test file

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

import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dialog from 'material-ui/Dialog';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

const style = {
  margin: 12,
};

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
  "Scorpion",
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


class Fact {
  check(world) {} // Stub
}

class TwoIngredientFact extends Fact {
  constructor(ingredients, possibleResults) {
    super()
    this.ingredients = ingredients
    this.possibleResults = possibleResults
  }

  check(world) {
    var alchemicalA = world[this.ingredients[0]]
    var alchemicalB = world[this.ingredients[1]]
    var result = mix(alchemicalA, alchemicalB)
    var potionIndex = _.findIndex(_.values(potions), _.curry(_.isEqual)(result))
    return this.possibleResults[potionIndex]
  }
}

// This is what a set of aspects looks like:
// [[1,0,0], [0,0,-1]] is red+ or blue-
class OneIngredientFact extends Fact {
  constructor(ingredient, setOfAspects) {
    super()
    this.ingredient = ingredient
    this.setOfAspects = setOfAspects
  }

  check(world) {
    var alchemical = world[fact.ingredient]
    for (var aspectIndex = 0; aspectIndex < this.setOfAspects.length; aspectIndex++) {
      var aspect = this.setOfAspects[aspectIndex]
      for (var i = 0; i < 3; i++) {
        if (aspect[i] === alchemical[i]) {
          return true;
        }
      }
    }
    return false;
  }
}


var ReactFact = React.createClass({
  mixins: [PureRenderMixin],

  render: function() {
    return <li>
      {this.props.index}: {JSON.stringify(this.props.item)}
      <RaisedButton onTouchTap={this.props.deleteFact} value={this.props.index} style={style}>Delete</RaisedButton>
    </li>
  }
});

var FactList = React.createClass({
  mixins: [PureRenderMixin],

  render: function() {
    return <ul>{this.props.items.map((fact, factIndex) => <ReactFact key={factIndex} item={fact} deleteFact={_.bind(function(){this.props.deleteFact(factIndex)}, this)}/>)}</ul>;
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
    return <TableRowColumn>{this.percentage()}</TableRowColumn>
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
    return (
      <TableRow>
        <TableRowColumn>{this.props.alchemical}</TableRowColumn>
        {ingredients.map((ingredient, index) => <SheetCell ingredientIndex={index} alchemical={this.props.alchemical} key={index} worlds={this.props.worlds}/>)}
      </TableRow>
    )
  }
})

var AddFactDialog = React.createClass({
  getInitialState: function() {
    return {
      open: false,
      currentFact: this.makeNewFact(),
    }
  },
  makeNewFact: function() {
    return new TwoIngredientFact([0, 1], [false, false, false, false, false, false, false])
  },
  handleOpen: function() {
    this.setState({open: true});
  },
  handleClose: function() {
    this.setState({open: false});
  },
  handleSubmit: function() {
    console.log(this.props)
    this.props.handleSubmit(this.state.currentFact)
    this.handleClose()
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
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label="Add Fact"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleSubmit}
      />,
    ];

    var self = this
    return (
      <div>
        <RaisedButton label="Add Two-Ingredient Fact" onTouchTap={this.handleOpen} />
        <Dialog
          title="Create a fact"
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
          <form action="" style={{display: "inline-block"}}>
            {ingredients.map((name, index) => <Ingredient name={name} ingredientNumber={0} key={index} callback={function() {self.ingredientChange(0, index)}} />)}
          </form>

          <form action="" style={{display: "inline-block"}}>
            {ingredients.map((name, index) => <Ingredient name={name} ingredientNumber={1} key={index} callback={function() {self.ingredientChange(1, index)}} />)}
          </form>

          <form action="" style={{display: "inline-block"}}>
            {_.keys(potions).map((name, index) => <Potion name={name} key={index} callback={function() {self.potionChange(index)}} />)}
          </form>
        </Dialog>
      </div>
    )
  }
})

var AlchemistsSolverApp = React.createClass({
  mixins: [PureRenderMixin],

  getInitialState: function() {
    return {
      factlist: [],
    }
  },
  handleSubmit: function(newFact) {
    this.setState({
      factlist: this.state.factlist.concat([newFact]),
    });
  },
  render: function() {
    var self = this;

    var worlds = permutator(alchemicals)
    for (var factIndex in this.state.factlist) {
      var fact = this.state.factlist[factIndex]
      worlds = _.filter(worlds, _.bind(fact.check, fact))
    }

    return (
      <MuiThemeProvider>
        <div>
          <h3>Alchemists Solver</h3>
          <FactList items={this.state.factlist} deleteFact={this.deleteFact}/>

          <AddFactDialog handleSubmit={this.handleSubmit}/>

          <div>Remaining worlds: {worlds.length}</div>

          <Table>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn/>
                {ingredients.map((name, index) => <TableHeaderColumn key={index}>{name}</TableHeaderColumn>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {alchemicals.map((alchemical, index) => <SheetRow alchemical={alchemical} key={index} worlds={worlds}/>)}
            </TableBody>
          </Table>
        </div>
      </MuiThemeProvider>
    );
  },
  deleteFact: function(deleteIndex) {
    this.setState({factlist: removeAtIndex(this.state.factlist, deleteIndex)})
  },
});

// non-mutating
function removeAtIndex(arr, index) {
  return _.filter(arr, function(val, idx) {return idx !== index})
}

// var ColorMapping = {
//   0: "red",
//   1: "green",
//   2: "blue",
// };

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
var exampleFact = new Fact(
  [exampleIngredientA, exampleIngredientB],
  [examplePotionA, examplePotionB]
)

console.log(exampleFact.check(exampleWorld))

export default AlchemistsSolverApp;
