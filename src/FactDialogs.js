import React from 'react'

import _ from 'lodash'

import Menu from 'antd/lib/menu'
import Dropdown from 'antd/lib/dropdown'
import InputNumber from 'antd/lib/input-number'
import Modal from 'antd/lib/modal'
import Button from 'antd/lib/button'
import Radio from 'antd/lib/radio';
import Checkbox from 'antd/lib/checkbox';

import {ingredients, potions, alchemicals, correctnessOpts} from './Enums.js'
import {GolemTestFact, GolemAnimationFact, LibraryFact, OneIngredientFact, TwoIngredientFact, RivalPublicationFact} from './Facts.js'
import {MyIcon} from './MyIcon.js'
import {CheckboxSelector} from './Misc.js'
import {flipBit} from './Logic.js'


class OpenCloseDialog extends React.PureComponent {
  state = {
      open: false,
  }
  handleOpen = () => {
    this.setState({open: true})
  }
  handleClose = () => {
    this.setState({open: false})
    this.props.handleReset()
  }
  handleSubmit = () => {
    this.props.handleSubmit()
    this.handleClose()
  }
  render() {
    const cancelButton = <Button key="cancel" type="ghost" size="large" onClick={this.handleClose}>Cancel</Button>
    let okButton
    if (this.props.disableReason) {
      okButton = <Button key="submit1" type="primary" size="large" disabled>{"Add Fact (" + this.props.disableReason + ")"}</Button>
    } else {
      okButton = <Button key="submit2" type="primary" size="large" onClick={this.handleSubmit}>Add Fact</Button>
    }
    return (
      <div>
        <Button onClick={this.handleOpen}>{this.props.buttonLabel}</Button>
        <Modal
          visible={this.state.open}
          title={this.props.title}
          okText="Add Fact"
          cancelText="Cancel"
          onOk={this.handleSubmit}
          onCancel={this.handleClose}
          closable={false}
          footer={[cancelButton, okButton]}
        >
        {this.props.children.map((child, index) => React.cloneElement(child, {key:index}))}
        </Modal>
      </div>
    )
  }
}

class FactDialog extends React.PureComponent {
  render(children, buttonLabel, disableReason) {
    return (
      <OpenCloseDialog
        buttonLabel={buttonLabel}
        title="Create a fact"
        children={children}
        handleSubmit={this.handleSubmit}
        handleReset={() => this.setState(this.defaultState)}
        disableReason={disableReason}
      />
    )
  }
}

class AddGolemTestFactDialog extends FactDialog {
  defaultState = {
    ingredient: 0,
    effects: [false, false],
  }
  state = this.defaultState

  handleSubmit = () => {
    this.props.handleSubmit(new GolemTestFact(this.state.ingredient, this.state.effects))
  }
  ingredientChange = (ingredient) => {
    this.setState({ingredient: ingredient})
  }
  effectChange = (index) => {
    this.setState({effects: flipBit(this.state.effects, index)})
  }
  render() {
    const children = [
      <IngredientSelector callback={this.ingredientChange} value={this.state.ingredient}/>,
      <CheckboxSelector values={this.state.effects} itemList={["ears", "chest"]} imageDir="golemTest" callback={this.effectChange}/>
    ]

    return super.render(children, "Add new Golem Test Fact")
  }
}

class AddGolemAnimationFactDialog extends FactDialog {
  defaultState = {
    ingredients: [0,1],
    success: false,
  }
  state = this.defaultState

  handleSubmit = () => {
    this.props.handleSubmit(new GolemAnimationFact(this.state.ingredients, this.state.success))
  }
  ingredientChange = (ingredientIndex, ingredient) => {
    let newIngredients = _.slice(this.state.ingredients)
    newIngredients[ingredientIndex] = ingredient
    this.setState({ingredients: newIngredients})
  }
  render() {
    const children = [
      <IngredientSelector callback={_.curry(this.ingredientChange)(0)} value={this.state.ingredients[0]} />,
      <IngredientSelector callback={_.curry(this.ingredientChange)(1)} value={this.state.ingredients[1]} />,
      <Checkbox checked={this.state.success} onChange={() => this.setState({success: !this.state.success})}>Success</Checkbox>,
    ]

    return super.render(children, "Add new Golem Animation Fact")
  }
}

class AddLibraryFactDialog extends FactDialog {
  defaultState = {
    ingredient: 0,
    solar: true,
  }
  state = this.defaultState

  handleSubmit = () => {
    this.props.handleSubmit(new LibraryFact(this.state.ingredient, this.state.solar))
  }
  ingredientChange = (ingredient) => {
    this.setState({ingredient: ingredient})
  }
  solarChange = (isSolar) => {
    this.setState({solar: isSolar})
  }
  render() {
    const children = [
      <IngredientSelector callback={this.ingredientChange} value={this.state.ingredient}/>,
      <SunMoonSelector callback={this.solarChange} value={this.state.solar}/>,
    ]

    return super.render(children, "Add new Library Fact")
  }
}

class AddOneIngredientFactDialog extends FactDialog {
  defaultState = {
    ingredient: 0,
    aspects: [false, false, false, false, false, false],
    bayesMode: false,
  }
  state = this.defaultState

  handleSubmit = () => {
    this.props.handleSubmit(new OneIngredientFact(this.state.ingredient, this.state.aspects, this.state.bayesMode))
  }
  ingredientChange = (ingredient) => {
    this.setState({ingredient: ingredient})
  }
  aspectChange = (index) => {
    this.setState({aspects: flipBit(this.state.aspects, index)})
  }
  render() {
    const imageDir = this.state.bayesMode ? "potions" : "aspects"
    const children = [
      <IngredientSelector callback={this.ingredientChange} value={this.state.ingredient} />,
      <CheckboxSelector values={this.state.aspects} itemList={_.keys(potions).slice(0,6)} imageDir={imageDir} callback={this.aspectChange} />,
      //TODO Sometimes when the below is clicked (too quickly?), the above fails to update images and they disappear instead
      <Checkbox checked={this.state.bayesMode} onChange={() => this.setState({bayesMode: !this.state.bayesMode})}>Bayes Mode</Checkbox>,
    ]

    let disableReason
    if (_.every(this.state.aspects)) {
      disableReason = "deselect at least one aspect"
    }
    if (_.every(this.state.aspects, _.negate(_.identity))) {
      disableReason = "select at least one aspect"
    }

    return super.render(children, "Add new One-Ingredient Fact", disableReason)
  }
}

class AddTwoIngredientFactDialog extends FactDialog {
  defaultState = {
    ingredients: [0,1],
    possibleResults: [false, false, false, false, false, false, false],
  }
  state = this.defaultState

  handleSubmit = () => {
    this.props.handleSubmit(new TwoIngredientFact(this.state.ingredients, this.state.possibleResults))
  }
  ingredientChange = (ingredientIndex, ingredient) => {
    let newIngredients = _.slice(this.state.ingredients)
    newIngredients[ingredientIndex] = ingredient
    this.setState({ingredients: newIngredients})
  }
  potionChange = (index) => {
    this.setState({possibleResults: flipBit(this.state.possibleResults, index)})
  }
  render() {
    const children = [
      <IngredientSelector callback={_.curry(this.ingredientChange)(0)} value={this.state.ingredients[0]} />,
      <IngredientSelector callback={_.curry(this.ingredientChange)(1)} value={this.state.ingredients[1]} />,
      <CheckboxSelector values={this.state.possibleResults} itemList={_.keys(potions)} imageDir="potions" callback={this.potionChange} />
    ]

    let disableReason
    if (this.state.ingredients[0] === this.state.ingredients[1]) {
      disableReason = "select two distinct ingredients"
    }
    if (_.every(this.state.possibleResults)) {
      disableReason = "deselect at least one potion"
    }
    if (_.every(this.state.possibleResults, _.negate(_.identity))) {
      disableReason = "select at least one potion"
    }

    return super.render(children, "Add new Two-Ingredient Fact", disableReason)
  }
}

// The values are irrelevant as long as they're distinct
const RIVAL_MENU_RIGHT = "right"
const RIVAL_MENU_GUESS = "guess"
const RIVAL_MENU_RED = "red"
const RIVAL_MENU_GREEN = "green"
const RIVAL_MENU_BLUE = "blue"
const RIVAL_MENU_BUNK = "bunk"

class AddRivalPublicationDialog extends FactDialog {
  defaultState = {
    ingredient: 0,
    alchemical: 0,
    odds: [1, 1, 1, 1, 1, 1, 1, 1],
  }
  state = this.defaultState

  handleSubmit = () => {
    if (_.findIndex(this.state.odds, (value) => value === 0) !== -1) {
      Modal.warning({
        title: 'Warning',
        content: 'Using 0 in an odds ratio implies utter certainty: no future evidence, however strong, can change your mind. Proceed at your own risk.',
      });
    }
    this.props.handleSubmit(new RivalPublicationFact(this.state.ingredient, this.state.alchemical, this.state.odds))
  }
  ingredientChange = (ingredient) => {
    this.setState({ingredient: ingredient})
  }
  alchemicalChange = (alchemical) => {
    this.setState({alchemical: alchemical})
  }
  chanceChange = (index, value) => {
    if (value !== undefined) {
      let odds = _.slice(this.state.odds)
      odds[index] = value
      this.setState({odds: odds})
    }
  }
  presetChange = (e) => {
    switch(e.key) {
      case RIVAL_MENU_RIGHT:
        this.setState({odds: [60, 5, 5, 5, 2, 2, 2, 1],})
        break;
      case RIVAL_MENU_GUESS:
        this.setState({odds: [1, 1, 1, 1, 1, 1, 1, 1],})
        break;
      case RIVAL_MENU_RED:
        this.setState({odds: [20, 20, 2, 2, 1, 2, 2, 1],})
        break;
      case RIVAL_MENU_GREEN:
        this.setState({odds: [20, 2, 20, 2, 2, 1, 2, 1],})
        break;
      case RIVAL_MENU_BLUE:
        this.setState({odds: [20, 2, 2, 20, 2, 2, 1, 1],})
        break;
      case RIVAL_MENU_BUNK:
        this.setState({odds: [1, 5, 5, 5, 25, 25, 25, 10],})
        break;
      default:
        console.log("ERROR: unknown case in presetChange")
    }
  }
  render() {
    const menu =
      <Menu onClick={this.presetChange}>
        <Menu.Item key={RIVAL_MENU_GUESS}>Completely guessing</Menu.Item>
        <Menu.Item key={RIVAL_MENU_RIGHT}>Probably right</Menu.Item>
        <Menu.SubMenu title="Hedging">
          <Menu.Item key={RIVAL_MENU_RED}>Red</Menu.Item>
          <Menu.Item key={RIVAL_MENU_GREEN}>Green</Menu.Item>
          <Menu.Item key={RIVAL_MENU_BLUE}>Blue</Menu.Item>
        </Menu.SubMenu>
        <Menu.Item key={RIVAL_MENU_BUNK}>BUNK BUNK BUNK! (aka Rafi mode)</Menu.Item>
      </Menu>

    let children = [
      <IngredientSelector callback={this.ingredientChange} value={this.state.ingredient} />,
      <AlchemicalSelector callback={this.alchemicalChange} value={this.state.alchemical} />,
      <div>
        <span style={{"fontWeight": 'bold'}}>Disregarding my own experiments, </span>
        <span>I think the odds are my opponent is...</span>
      </div>,
      <Dropdown overlay={menu}>
        <div>
          [Mouse over to select a preset]
        </div>
      </Dropdown>,
    ]
    children = children.concat(_.map(this.state.odds, (value, index) =>
      <div>
        <span style={{float:"left"}}>{_.keys(correctnessOpts)[index] + ": " + value + " "}</span>
        <InputNumber
          style={{float:"right"}}
          size="small"
          min={0}
          value={this.state.odds[index]}
          onChange={value => this.chanceChange(index, value)}
        />
        <br/>
        <br/>
      </div>
    ))

    return super.render(children, "Add new Rival Publication")
  }
}

function IngredientSelector({callback, value}) {
  return (
    <Radio.Group onChange={e => callback(e.target.value)} value={value} >
      {ingredients.map((name, index) =>
        <Radio style={{display: 'inline-block'}} value={index} key={name}>
          {<MyIcon imageDir='ingredients' name={name}/>}
        </Radio>)}
    </Radio.Group>
  )
}

function AlchemicalSelector({callback, value}) {
  return (
    <Radio.Group onChange={e => callback(e.target.value)} value={value} >
      {alchemicals.map((name, index) =>
        <Radio style={{display: 'inline-block'}} value={index} key={index}>
          {<MyIcon imageDir='alchemicals' name={name.join("")}/>}
        </Radio>)}
    </Radio.Group>
  )
}

function SunMoonSelector({callback, value}) {
  return (
    <Radio.Group onChange={e => callback(e.target.value)} value={value} >
      <Radio style={{display: 'inline-block'}} value={true} key="solar">
        {<MyIcon imageDir="classes" name="solar"/>}
      </Radio>
      <Radio style={{display: 'inline-block'}} value={false} key="lunar">
        {<MyIcon imageDir="classes" name="lunar"/>}
      </Radio>
    </Radio.Group>
  )
}

export {AddOneIngredientFactDialog, AddTwoIngredientFactDialog,
  AddLibraryFactDialog, AddGolemTestFactDialog, AddGolemAnimationFactDialog,
  AddRivalPublicationDialog}
