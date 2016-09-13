// === UI stuff ===
//TODO visualize the alchemicals in the row headers of the table
//TODO add pictures for the ingredients in the column headers of the table
//TODO add pictures of the aspects for the check boxes (low priority)
//TODO add refresh indicators http://www.material-ui.com/#/components/refresh-indicator
//TODO downsize columns (and rows)
//TODO add a nice toimage function for facts
//TODO add more space between columns in fact dialogs

// === Additional views ===
//TODO add view to see individual worlds when you have just a few
//TODO add view for best things to mix for the adventurer

// === Other stuff ===
//TODO make the view match the state for the buttons etc. This is an issue when you first open up the dialog
//TODO fix lag issues
//TODO move tests into the test file
//TODO filter package.json unneeded packages

// The expected number of bits of information from real science is
// -[1/7*lg(1/7) * 7]
// = 2.807 bits

// The expected number of bits of information from experimenting randomly on an adventurer is
// -[1/7*lg(1/7) + 2/7*lg(2/7) + 1/7*lg(1/7) + 3/7*lg(3/7)]
// = 1.842 bits

import AboutDialog from './AboutDialog.js'
import {AddTwoIngredientFactDialog, AddOneIngredientFactDialog} from './FactDialogs.js'
import {Image} from 'react-native'
import {alchemicals, ingredients} from './Enums.js'
import {myCurry} from './utils.js'

import React from 'react';
import './App.css';

import _ from 'lodash'
import PureRenderMixin from 'react-addons-pure-render-mixin';

import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

const style = {
  margin: 12,
};

// This is what an Alchemical looks like:
// [1, 1, -1]

class ReactFact extends React.Component {
  mixins = [PureRenderMixin]

  render() {
    return <li>
      {this.props.index}: {JSON.stringify(this.props.item)}
      <RaisedButton onTouchTap={this.props.deleteFact} value={this.props.index} style={style}>Delete</RaisedButton>
    </li>
  }
}

class FactList extends React.Component {
  mixins = [PureRenderMixin]

  render() {
    return <ul>{this.props.items.map((fact, factIndex) => <ReactFact key={factIndex} item={fact} deleteFact={myCurry(this.props.deleteFact, factIndex)} />)}</ul>;
  }
}

class SheetCell extends React.Component {
  mixins = [PureRenderMixin]

  render() {
    return <TableRowColumn>{this.percentage()}</TableRowColumn>
  }
  percentage() {
    var worlds = _.filter(this.props.worlds, _.bind(function(world) {
      return _.isEqual(world[this.props.ingredientIndex], this.props.alchemical)
    }, this))
    return Math.round(100 * worlds.length / this.props.worlds.length, 0)
  }
}

class SheetRow extends React.Component {
  mixins = [PureRenderMixin]

  render() {
    return (
      <TableRow>
        <TableRowColumn><Image source={require("../images/alchemicals/" + this.props.alchemical.join("") + ".png")} /></TableRowColumn>
        {ingredients.map((ingredient, index) => <SheetCell ingredientIndex={index} alchemical={this.props.alchemical} key={index} worlds={this.props.worlds}/>)}
      </TableRow>
    )
  }
}

class AlchemistsSolverApp extends React.Component {
  mixins = [PureRenderMixin]

  state = {
    factlist: [],
  }
  handleSubmit = (newFact) => {
    this.setState({
      factlist: this.state.factlist.concat([newFact]),
    });
  }
  render() {
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

          <AddTwoIngredientFactDialog handleSubmit={this.handleSubmit}/>
          <AddOneIngredientFactDialog handleSubmit={this.handleSubmit}/>

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

          <AboutDialog/>
        </div>
      </MuiThemeProvider>
    );
  }
  deleteFact = (deleteIndex) => {
    this.setState({factlist: removeAtIndex(this.state.factlist, deleteIndex)})
  }
}

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

export default AlchemistsSolverApp;
