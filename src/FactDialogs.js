import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {Image, View} from 'react-native'

import _ from 'lodash'

import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import Checkbox from 'material-ui/Checkbox';

import {potions, ingredients, aspects} from './Enums.js'


class Fact {
  check(world) {} // Stub
}

// This is what a set of aspects looks like:
// [[1,0,0], [0,0,-1]] is red+ or blue-
class OneIngredientFact extends Fact {
  constructor(ingredient, setOfAspects) {
    super()
    this.ingredient = ingredient
    this.setOfAspects = setOfAspects
  }

  check = (world) => {
    var alchemical = world[this.ingredient]
    for (var aspectIndex = 0; aspectIndex < this.setOfAspects.length; aspectIndex++) {
      if (this.setOfAspects[aspectIndex]) {
        var aspect = _.values(aspects)[aspectIndex]
        for (var color = 0; color < 3; color++) {
          if (aspect[color] === alchemical[color]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  render = () => {
    var aspectNames = _.filter(_.keys(aspects), (name, index) => {
      return this.setOfAspects[index]
    })
    var text
    if (aspectNames.length === 1) {
      text = "has"
    } else {
      text = "has at least one of"
    }

    return <View style={{flexDirection:'row', flexWrap:'wrap'}}>
      <MyIcon imageDir='ingredients' name={ingredients[this.ingredient]}/>
      {text}
      {aspectNames.map((name, index) => <MyIcon imageDir='aspects' name={name} key={index}/>)}
    </View>
  }
}

class TwoIngredientFact extends Fact {
  constructor(ingredients, possibleResults) {
    super()
    this.ingredients = ingredients
    this.possibleResults = possibleResults
  }

  check = (world) => {
    var alchemicalA = world[this.ingredients[0]]
    var alchemicalB = world[this.ingredients[1]]
    var result = mix(alchemicalA, alchemicalB)
    var potionIndex = _.findIndex(_.values(potions), _.curry(_.isEqual)(result))
    return this.possibleResults[potionIndex]
  }

  render = () => {
    var numTrue = _.filter(this.possibleResults).length
    var potionNames = _.keys(potions)

    if (numTrue === potionNames.length - 1) {
      var potionName = potionNames[_.findIndex(this.possibleResults, _.negate(_.identity))]
      return this.showFact('≠', [potionName])
    }

    potionNames = _.filter(potionNames, (name, index) => {
      return this.possibleResults[index]
    })
    if (potionNames.length === 1
        || _.every(potionNames, function(name) {return name.indexOf('+') !== -1})
        || _.every(potionNames, function(name) {return name.indexOf('-') !== -1})) {
      return this.showFact('=', [potionNames.join("")])
    }

    return this.showFact('∈', potionNames)
  }

  showFact = (seperator, potionList) => {
    return <View style={{flexDirection:'row', flexWrap:'wrap'}}>
      <MyIcon imageDir='ingredients' name={ingredients[this.ingredients[0]]}/>
      +
      <MyIcon imageDir='ingredients' name={ingredients[this.ingredients[1]]}/>
      {seperator}
      {potionList.map((name, index) => <MyIcon imageDir='potions' name={name} key={index}/>)}
    </View>
  }
}

// Alchemical -> Alchemical -> Potion
function mix(alchemicalA, alchemicalB) {
  var mean = _.zipWith(alchemicalA, alchemicalB, function(a,b){return (a+b)/2})
  for (var index = 0; index < 3; index++) {
    if (mean[(index+1) % 3] !== 0)
      mean[index] = 0
  }

  return mean
}

class OpenCloseDialog extends React.Component {
  state = {
      open: false,
  }
  handleOpen = () => {
    this.props.handleReset()
    this.setState({open: true})
  }
  handleClose = () => {
    this.setState({open: false})
  }
  handleSubmit = () => {
    this.props.handleSubmit()
    this.handleClose()
  }
  render() {
    var {children, buttonLabel, ...other} = this.props

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

    return (
      <div>
        <RaisedButton label={buttonLabel} onTouchTap={this.handleOpen} />
        <Dialog {...other}
          open={this.state.open}
          onRequestClose={this.handleClose}
          actions={actions}
        >
        {children}
        </Dialog>
      </div>
    )
  }
}

var flipBit = function(oldBitSet, index) {
  var newBitSet = _.slice(oldBitSet)
  newBitSet[index] = !oldBitSet[index]
  return newBitSet
}

class AddOneIngredientFactDialog extends React.Component {
  mixins = [PureRenderMixin]

  state = this.defaultState
  defaultState = {
    ingredient: 1,
    aspects: [false, false, false, false, false, false],
  }
  handleSubmit = () => {
    for (var i = 0; i < 6; i += 2) {
      if (this.state.aspects[i] && this.state.aspects[i+1]) {
        alert("Ignoring vacuous fact: It is always true that an ingredient contains at least one of " + _.keys(aspects)[i] + " and " + _.keys(aspects)[i+1] + ".")
        return
      }
    }
    if (_.every(this.state.aspects, _.negate(_.identity))) {
      alert("Ignoring impossible fact: It is never true that an ingredient contains at least one aspect of the empty set.")
      return
    }
    this.props.handleSubmit(new OneIngredientFact(this.state.ingredient, this.state.aspects))
  }
  ingredientChange = (event, ingredient) => {
    this.setState({ingredient: ingredient})
  }
  handleReset = () => {
    this.setState(this.defaultState)
  }
  aspectChange = (index) => {
    this.setState({aspects: flipBit(this.state.aspects, index)})
  }
  render() {
    var self = this

    const children = [
      <IngredientSelector default={1} key={0} callback={self.ingredientChange} />,
      // <div style={{display: 'inline-block'}}>Contains at least one of</div>,
      <AspectSelector key={1} callback={self.aspectChange} />
    ]

    return (
      <OpenCloseDialog
        buttonLabel="Add new One-Ingredient Fact"
        title="Create a fact"
        children={children}
        handleSubmit={this.handleSubmit}
        handleReset={this.handleReset}
        modal={false}
      />
    )
  }
}

class AddTwoIngredientFactDialog extends React.Component {
  mixins = [PureRenderMixin]

  state = this.defaultState
  defaultState = {
    ingredients: [1,2],
    possibleResults: [false, false, false, false, false, false, false],
  }
  handleSubmit = () => {
    if (this.state.ingredients[0] === this.state.ingredients[1]) {
      alert("Ignoring malformed fact: You cannot mix an ingredient with itself.")
      return
    }
    if (_.every(this.state.possibleResults)) {
      alert("Ignoring vacuous fact: It is always true that two distinct ingredients form some potion in the full list of potions.")
      return
    }
    if (_.every(this.state.possibleResults, _.negate(_.identity))) {
      alert("Ignoring impossible fact: It is never true that two distinct ingredients form some potion in the empty set.")
      return
    }
    this.props.handleSubmit(new TwoIngredientFact(this.state.ingredients, this.state.possibleResults))
  }
  handleReset = () => {
    this.setState(this.defaultState)
  }
  ingredientChange = (ingredientIndex, event, ingredient) => {
    var newIngredients = _.slice(this.state.ingredients)
    newIngredients[ingredientIndex] = ingredient;
    this.setState({ingredients: newIngredients})
  }
  potionChange = (index) => {
    this.setState({possibleResults: flipBit(this.state.possibleResults, index)})
  }
  render() {
    var self = this

    const children = [
      <IngredientSelector default={1} key={0} callback={_.curry(self.ingredientChange)(0)} />,
      <IngredientSelector default={2} key={1} callback={_.curry(self.ingredientChange)(1)} />,
      <PotionSelector key={2} callback={self.potionChange} />
    ]

    return (
      <OpenCloseDialog
        buttonLabel="Add new Two-Ingredient Fact"
        title="Create a fact"
        children={children}
        handleSubmit={this.handleSubmit}
        handleReset={this.handleReset}
        modal={false}
      />
    )
  }
}

function PotionSelector(props) {
  return (
    <form action="" style={{display: "inline-block"}}>
      {_.keys(potions).map((name, index) => <Potion name={name} key={index} callback={() => {props.callback(index)}} />)}
    </form>
  )
}

function AspectSelector(props) {
  return (
    <form action="" style={{display: "inline-block"}}>
      {_.keys(aspects).map((name, index) => <Potion name={name} key={index} callback={() => {props.callback(index)}} />)}
    </form>
  )
}

function IngredientSelector(props) {
  return (
    <RadioButtonGroup name="foo" style={{display: 'inline-block'}} onChange={props.callback} defaultSelected={props.default}>
      {ingredients.map((name, index) => <RadioButton
        value={index}
        label={<MyIcon imageDir='ingredients' name={name}/>}
        key={index}
      />)}
      {/* {ingredients.map((name, index) => <Ingredient name={name} index={index} key={index}/>)} */}
    </RadioButtonGroup>
  )
}

function MyIcon(props) {
  return <Image
    style={{resizeMode: "contain", width: 30, height: 30}}
    source={require('../images/' + props.imageDir + '/' + props.name + '.png')}
  />
}

//TODO why can't we use this in IngredientSelector?
function Ingredient(props) {
  return <RadioButton
    value={props.index}
    label={<MyIcon imageDir='ingredients' name={props.name}/>}
    key={props.index}
  />
}

function Potion(props) {
  return <Checkbox
      onCheck={props.callback}
      label={<MyIcon imageDir='potions' name={props.name}/>}
  />
}

export {AddOneIngredientFactDialog, AddTwoIngredientFactDialog}
