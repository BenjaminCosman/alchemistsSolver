import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import {Image, View} from 'react-native'

import _ from 'lodash'

import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import Dialog from 'material-ui/Dialog'
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton'
import Checkbox from 'material-ui/Checkbox'

import {potions, potionsInverted, ingredients, alchemicals, fileNames} from './Enums.js'


class Fact {
  updatePrior(weightedWorld) {} // Stub
}

class GolemTestFact extends Fact {
  constructor(ingredient, effects) {
    super()
    this.ingredient = ingredient
    this.effects = effects
  }

  updatePrior = (weightedWorld) => {
    var golemMap = weightedWorld.golemMap
    var alchemical = alchemicals[weightedWorld.ingAlcMap[this.ingredient]]

    var sizes = [0,0,0]
    for (var i = 0; i < 3; i++) {
      sizes[i] = alchemical[i] === alchemical[(i+1) % 3] ? 1 : -1
    }

    for (var aspect = 0; aspect < 3; aspect++) {
      var effect = golemMap[aspect]
      if (effect === 'nothing') {
        continue;
      }
      var effectIndex = _.findIndex(['ears', 'chest'], (value) => value === effect.affects)
      if ((effect.size === sizes[aspect]) !== this.effects[effectIndex]) {
        weightedWorld.multiplicity = 0
      }
    }
  }

  render = () => {
    return <View style={{flexDirection:'row', flexWrap:'wrap'}}>
      <MyIcon imageDir='ingredients' name={ingredients[this.ingredient]}/>
      {"has effects on ears and chest: " + this.effects}
    </View>
  }
}

class LibraryFact extends Fact {
  constructor(ingredient, isSolar) {
    super()
    this.ingredient = ingredient
    this.isSolar = isSolar
  }

  updatePrior = (weightedWorld) => {
    var world = weightedWorld.ingAlcMap
    var alchemical = alchemicals[world[this.ingredient]]
    var isSolar = _.filter(alchemical, (value) => (value === -1)).length % 2 === 0
    if (isSolar !== this.isSolar) {
      weightedWorld.multiplicity = 0
    }
  }

  render = () => {
    return <View style={{flexDirection:'row', flexWrap:'wrap'}}>
      <MyIcon imageDir='ingredients' name={ingredients[this.ingredient]}/>
      {"is " + (this.isSolar ? "solar" : "lunar")}
    </View>
  }
}

// This is what a set of aspects looks like:
// [[1,0,0], [0,0,-1]] is red+ or blue-
class OneIngredientFact extends Fact {
  constructor(ingredient, setOfAspects, bayesMode) {
    super()
    this.ingredient = ingredient
    this.setOfAspects = setOfAspects
    this.bayesMode = bayesMode
  }

  updatePrior = (weightedWorld) => {
    var world = weightedWorld.ingAlcMap
    var likelihoodFactor = 0
    var alchemical = alchemicals[world[this.ingredient]]
    for (var aspectIndex = 0; aspectIndex < this.setOfAspects.length; aspectIndex++) {
      if (this.setOfAspects[aspectIndex]) {
        var aspect = _.values(potions)[aspectIndex]
        for (var color = 0; color < 3; color++) {
          if (aspect[color] === alchemical[color]) {
            if (this.bayesMode) {
              likelihoodFactor += 1
            } else {
              likelihoodFactor = 1
            }
          }
        }
      }
    }
    weightedWorld.multiplicity *= likelihoodFactor
  }

  render = () => {
    var aspectNames = _.filter(fileNames, (name, index) => {
      return this.setOfAspects[index]
    })

    var text
    var imageDir
    if (this.bayesMode) {
      text = "made"
      imageDir = "potions"
    } else {
      text = "has"
      imageDir = "aspects"
    }
    if (aspectNames.length !== 1) {
      text += " at least one of"
    }

    return <View style={{flexDirection:'row', flexWrap:'wrap'}}>
      <MyIcon imageDir='ingredients' name={ingredients[this.ingredient]}/>
      {text}
      {aspectNames.map((name, index) => <MyIcon imageDir={imageDir} name={name} key={index}/>)}
    </View>
  }
}

class TwoIngredientFact extends Fact {
  constructor(ingredients, possibleResults) {
    super()
    this.ingredients = ingredients
    this.possibleResults = possibleResults
  }

  // This function is in the inner loop and so we're optimizing it
  updatePrior = (weightedWorld) => {
    var world = weightedWorld.ingAlcMap
    var alchemicalA = alchemicals[world[this.ingredients[0]]]
    var alchemicalB = alchemicals[world[this.ingredients[1]]]
    var result = mix(alchemicalA, alchemicalB)
    var potionIndex = potionsInverted["" + result]
    weightedWorld.multiplicity *= this.possibleResults[potionIndex]
  }

  render = () => {
    var numTrue = _.filter(this.possibleResults).length
    var potionNames = _.slice(fileNames)

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
  if (alchemicalA[0] === alchemicalB[0] && alchemicalA[1] !== alchemicalB[1]) {
    return [alchemicalA[0], 0, 0]
  }
  if (alchemicalA[1] === alchemicalB[1] && alchemicalA[2] !== alchemicalB[2]) {
    return [0, alchemicalA[1], 0]
  }
  if (alchemicalA[2] === alchemicalB[2] && alchemicalA[0] !== alchemicalB[0]) {
    return [0, 0, alchemicalA[2]]
  }
  return [0, 0, 0]
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
    ]

    return (
      <div>
        <RaisedButton label={buttonLabel} onTouchTap={this.handleOpen} />
        <Dialog {...other}
          open={this.state.open}
          onRequestClose={this.handleClose}
          actions={actions}
          autoScrollBodyContent={true}
        >
        {children.map((child, index) => React.cloneElement(child, {key:index}))}
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

class AddGolemTestFactDialog extends React.Component {
  mixins = [PureRenderMixin]

  state = this.defaultState
  defaultState = {
    ingredient: 1,
    effects: [false, false],
  }
  handleSubmit = () => {
    this.props.handleSubmit(new GolemTestFact(this.state.ingredient, this.state.effects))
  }
  ingredientChange = (event, ingredient) => {
    this.setState({ingredient: ingredient})
  }
  handleReset = () => {
    this.setState(this.defaultState)
  }
  effectChange = (index) => {
    this.setState({effects: flipBit(this.state.effects, index)})
  }
  render() {
    const children = [
      <IngredientSelector default={1} callback={this.ingredientChange} />,
      <form action="" style={{display: "inline-block", padding: 30}}>
        {_.map(["ears", "chest"], (name, index) =>
          <Checkbox name={name} label={name} key={index} onCheck={() => {this.effectChange(index)}} />)
        }
      </form>
    ]

    return (
      <OpenCloseDialog
        buttonLabel="Add new Golem Test Fact"
        title="Create a fact"
        children={children}
        handleSubmit={this.handleSubmit}
        handleReset={this.handleReset}
        modal={false}
      />
    )
  }
}

class AddLibraryFactDialog extends React.Component {
  mixins = [PureRenderMixin]

  state = this.defaultState
  defaultState = {
    ingredient: 1,
    solar: true,
  }
  handleSubmit = () => {
    this.props.handleSubmit(new LibraryFact(this.state.ingredient, this.state.solar))
  }
  ingredientChange = (event, ingredient) => {
    this.setState({ingredient: ingredient})
  }
  handleReset = () => {
    this.setState(this.defaultState)
  }
  solarChange = (event, isSolar) => {
    this.setState({solar: isSolar})
  }
  render() {
    const children = [
      <IngredientSelector default={1} callback={this.ingredientChange} />,
      <SunMoonSelector default={true} callback={this.solarChange} />,
    ]

    return (
      <OpenCloseDialog
        buttonLabel="Add new Library Fact"
        title="Create a fact"
        children={children}
        handleSubmit={this.handleSubmit}
        handleReset={this.handleReset}
        modal={false}
      />
    )
  }
}

class AddOneIngredientFactDialog extends React.Component {
  mixins = [PureRenderMixin]

  state = this.defaultState
  defaultState = {
    ingredient: 1,
    aspects: [false, false, false, false, false, false],
    bayesMode: false,
  }
  handleSubmit = () => {
    if (_.every(this.state.aspects, _.negate(_.identity))) {
      alert("Ignoring impossible fact: Select at least one aspect.")
      return
    }
    this.props.handleSubmit(new OneIngredientFact(this.state.ingredient, this.state.aspects, this.state.bayesMode))
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
    //TODO why is the non-null check necessary? (here and elsewhere)
    var imageDir = (this.state !== null && this.state.bayesMode) ? "potions" : "aspects"
    const children = [
      <IngredientSelector default={1} callback={this.ingredientChange} />,
      <CheckboxSelector itemList={fileNames.slice(0,6)} imageDir={imageDir} callback={this.aspectChange} />,
      <Checkbox onCheck={() => this.setState({bayesMode: !this.state.bayesMode})} label={"Bayes Mode"}/>,
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
      alert("Ignoring malformed fact: Do not mix an ingredient with itself.")
      return
    }
    if (_.every(this.state.possibleResults)) {
      alert("Ignoring vacuous fact: Do not select all potions.")
      return
    }
    if (_.every(this.state.possibleResults, _.negate(_.identity))) {
      alert("Ignoring impossible fact: Select at least one potion.")
      return
    }
    this.props.handleSubmit(new TwoIngredientFact(this.state.ingredients, this.state.possibleResults))
  }
  handleReset = () => {
    this.setState(this.defaultState)
  }
  ingredientChange = (ingredientIndex, event, ingredient) => {
    var newIngredients = _.slice(this.state.ingredients)
    newIngredients[ingredientIndex] = ingredient
    this.setState({ingredients: newIngredients})
  }
  potionChange = (index) => {
    this.setState({possibleResults: flipBit(this.state.possibleResults, index)})
  }
  render() {
    const children = [
      <IngredientSelector default={1} callback={_.curry(this.ingredientChange)(0)} />,
      <IngredientSelector default={2} callback={_.curry(this.ingredientChange)(1)} />,
      <CheckboxSelector itemList={fileNames} imageDir={"potions"} callback={this.potionChange} />
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

function CheckboxSelector(props) {
  return (
    <form action="" style={{display: "inline-block", padding: 30}}>
      {props.itemList.map((name, index) => <IconCheckbox imageDir={props.imageDir} name={name} key={index} callback={() => {props.callback(index)}} />)}
    </form>
  )
}

function IngredientSelector(props) {
  return (
    <RadioButtonGroup name="foo" style={{display: 'inline-block', padding: 30}} onChange={props.callback} defaultSelected={props.default}>
      {ingredients.map((name, index) => <RadioButton
        value={index}
        label={<MyIcon imageDir='ingredients' name={name}/>}
        key={index}
      />)}
      {/* {ingredients.map((name, index) => <Ingredient name={name} index={index} key={index}/>)} */}
    </RadioButtonGroup>
  )
}

function SunMoonSelector(props) {
  return (
    <RadioButtonGroup name="foo" style={{display: 'inline-block', padding: 30}} onChange={props.callback} defaultSelected={props.default}>
      <RadioButton value={false} label="lunar" key={0} />
      <RadioButton value={true} label="solar" key={1} />
    </RadioButtonGroup>
  )
}

function MyIcon(props) {
  return <Image
    resizeMode={"contain"}
    style={{width: 30, height: 30}}
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

function IconCheckbox(props) {
  return <Checkbox
    onCheck={props.callback}
    label={<MyIcon imageDir={props.imageDir} name={props.name}/>}
  />
}

export {AddOneIngredientFactDialog, AddTwoIngredientFactDialog, AddLibraryFactDialog, AddGolemTestFactDialog}
