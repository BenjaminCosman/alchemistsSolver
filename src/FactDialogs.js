import React from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import _ from 'lodash'

import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import Dialog from 'material-ui/Dialog'
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton'
import Checkbox from 'material-ui/Checkbox'
import NumberInput from 'material-ui-number-input';

// import { Menu, Dropdown, Icon } from 'antd';

import {ingredients, fileNames, alchemicals, correctnessOpts} from './Enums.js'
import {GolemTestFact, LibraryFact, OneIngredientFact, TwoIngredientFact, RivalPublicationFact} from './Logic.js'
import {MyIcon} from './MyIcon.js'

class OpenCloseDialog extends React.Component {
  state = {
      open: false,
  }
  handleOpen = () => {
    this.setState({open: true})
  }
  handleClose = () => {
    this.props.handleReset()
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

  defaultState = {
    ingredient: 1,
    effects: [false, false],
  }
  state = this.defaultState

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
      />
    )
  }
}

class AddLibraryFactDialog extends React.Component {
  mixins = [PureRenderMixin]

  defaultState = {
    ingredient: 1,
    solar: true,
  }
  state = this.defaultState

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
      />
    )
  }
}

class AddOneIngredientFactDialog extends React.Component {
  mixins = [PureRenderMixin]

  defaultState = {
    ingredient: 1,
    aspects: [false, false, false, false, false, false],
    bayesMode: false,
  }
  state = this.defaultState

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
    var imageDir = this.state.bayesMode ? "potions" : "aspects"
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
      />
    )
  }
}

class AddTwoIngredientFactDialog extends React.Component {
  mixins = [PureRenderMixin]

  defaultState = {
    ingredients: [1,2],
    possibleResults: [false, false, false, false, false, false, false],
  }
  state = this.defaultState

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
      />
    )
  }
}

class AddRivalPublicationDialog extends React.Component {
  mixins = [PureRenderMixin]

  defaultState = {
    ingredient: 1,
    alchemical: 1,
    chances: [81, 5, 5, 5, 1, 1, 1, 1],
  }
  state = this.defaultState

  handleSubmit = () => {
    this.props.handleSubmit(new RivalPublicationFact(this.state.ingredient, this.state.alchemical, this.state.chances))
  }
  ingredientChange = (event, ingredient) => {
    this.setState({ingredient: ingredient})
  }
  handleReset = () => {
    this.setState(this.defaultState)
  }
  alchemicalChange = (event, alchemical) => {
    this.setState({alchemical: alchemical})
  }
  chanceChange = (index, value) => {
    let chances = _.slice(this.state.chances)
    chances[index] = value
    // let total = _.sum(_.values(chances))
    // if (total > 1) {
    //   chances[name] = math.round(chances[name] - total + 1, 2)
    // }
    // if (this.state.safeMode) {
    //   if (chances[name] === 0) {
    //     chances[name] = SLIDER_STEP
    //   } else if (chances[name] === 1) {
    //     chances[name] = 1-SLIDER_STEP
    //   }
    // }
    this.setState({chances: chances})
  }
  render() {
    // let menu =
    //   <Menu>
    //     <Menu.Item>1st menu item</Menu.Item>
    //     <Menu.Item>2nd menu item</Menu.Item>
    //     <Menu.SubMenu title="sub menu">
    //       <Menu.Item>3d menu item</Menu.Item>
    //       <Menu.Item>4th menu item</Menu.Item>
    //     </Menu.SubMenu>
    //   </Menu>

    let children = [
      <IngredientSelector default={1} callback={this.ingredientChange} />,
      <AlchemicalSelector default={1} callback={this.alchemicalChange} />,
      // <Dropdown overlay={menu}>
      //   <a className="ant-dropdown-link" href="#">
      //     Cascading menu <Icon type="down" />
      //   </a>
      // </Dropdown>,
      <div>
        <span style={{"fontWeight": 'bold'}}>Disregarding my own experiments, </span>
        <span>I think the odds are my opponent is...</span>
        <br/>
        <br/>
      </div>
    ]
    if (this.state !== null) {
      children = children.concat(_.map(this.state.chances, (value, index) =>
        <div>
          <span style={{float:"left"}}>{_.keys(correctnessOpts)[index] + ": " + value + " "}</span>
          <NumberInput
            style={{float:"right"}}
            id="num"
            min={0}
            onValid={value => this.chanceChange(index, value)}
          />
          <br/>
          <br/>
          <br/>
        </div>
      ))
    }

    return (
      <OpenCloseDialog
        buttonLabel="Add new Rival Publication"
        title="Create a fact"
        children={children}
        handleSubmit={this.handleSubmit}
        handleReset={this.handleReset}
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

function AlchemicalSelector(props) {
  return (
    <RadioButtonGroup name="foo" style={{display: 'inline-block', padding: 30}} onChange={props.callback} defaultSelected={props.default}>
      {alchemicals.map((name, index) => <RadioButton
        value={index}
        label={<MyIcon imageDir='alchemicals' name={name.join("")}/>}
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

export {AddOneIngredientFactDialog, AddTwoIngredientFactDialog, AddLibraryFactDialog, AddGolemTestFactDialog, AddRivalPublicationDialog}
