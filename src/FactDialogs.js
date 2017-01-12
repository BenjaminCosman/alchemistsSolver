import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import _ from 'lodash'

import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import Dialog from 'material-ui/Dialog'
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton'
import Checkbox from 'material-ui/Checkbox'

import {ingredients, fileNames} from './Enums.js'
import {GolemTestFact, LibraryFact, OneIngredientFact, TwoIngredientFact} from './Logic.js'
import {MyIcon} from './MyIcon.js'

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
      {props.itemList.map((name, index) => <IconCheckbox imageDir={props.imageDir} name={name} key={index} callback={() => props.callback(index)} />)}
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

function IconCheckbox(props) {
  return <Checkbox
    onCheck={props.callback}
    label={<MyIcon imageDir={props.imageDir} name={props.name}/>}
  />
}

export {AddOneIngredientFactDialog, AddTwoIngredientFactDialog, AddLibraryFactDialog, AddGolemTestFactDialog}
