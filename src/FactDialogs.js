import React from 'react'

import _ from 'lodash'

import Menu from 'antd/lib/menu'
import Dropdown from 'antd/lib/dropdown'
import InputNumber from 'antd/lib/input-number'
import Modal from 'antd/lib/modal'
import Button from 'antd/lib/button'
import Radio from 'antd/lib/radio'
import Checkbox from 'antd/lib/checkbox'

import {ingredients, potions, alchemicals, correctnessOpts} from './Enums.js'
import {GolemTestFact, GolemAnimationFact, LibraryFact, OneIngredientFact, TwoIngredientFact, RivalPublicationFact} from './Facts.js'
import {MyIcon} from './MyIcon.js'
import {CheckboxSelector} from './Misc.js'
import {flipBit} from './Logic.js'

// All specific fact dialogs contain one of these
function FactDialog({handleSubmit, buttonLabel, disableReason, children}) {
  const [open, setOpen] = React.useState(false)

  const cancelButton = <Button key="cancel" type="ghost" size="large" onClick={() => setOpen(false)}>Cancel</Button>
  let okButton
  if (disableReason) {
    okButton = <Button key="submit1" type="primary" size="large" disabled>{"Add Fact (" + disableReason + ")"}</Button>
  } else {
    okButton = <Button key="submit2" type="primary" size="large" onClick={() => {handleSubmit(); setOpen(false)}}>Add Fact</Button>
  }
  return <>
    <Button onClick={() => setOpen(true)}>{buttonLabel}</Button>
    <Modal
      visible={open}
      title="Create a fact"
      closable={false}
      footer={[cancelButton, okButton]}
    >
    {children}
    </Modal>
  </>
}

// Some React Hooks
function useArrayState(initialArray) {
  const [state, setState] = React.useState(initialArray)
  const setStateAtIdx = (idx, newVal) => {
    let newState = _.slice(state)
    newState[idx] = newVal
    setState(newState)
  }
  return [state, setState, setStateAtIdx]
}
function useFlipBitsArrayState(arraySize) {
  const [state, setState] = React.useState(Array(arraySize).fill(false))
  const f = (idx) => {
    setState(flipBit(state, idx))
  }
  return [state, f]
}

/////////////////////////////////////////////////////
// Specific fact dialogs, ordered from common to rare
/////////////////////////////////////////////////////

function AddTwoIngredientFactDialog({handleSubmit}) {
  const [ourIngredients, _setOurIngredients, setOurIngredientsAtIdx] = useArrayState([0,1])
  const [possibleResults, flipPossibleResultsBit] = useFlipBitsArrayState(7)

  let disableReason
  if (ourIngredients[0] === ourIngredients[1]) {
    disableReason = "select two distinct ingredients"
  }
  if (_.every(possibleResults)) {
    disableReason = "deselect at least one potion"
  }
  if (_.every(possibleResults, _.negate(_.identity))) {
    disableReason = "select at least one potion"
  }

  return <FactDialog
    buttonLabel="Add new Two-Ingredient Fact"
    handleSubmit={() => handleSubmit(new TwoIngredientFact(ourIngredients, possibleResults))}
    disableReason={disableReason}
  >
    <IngredientSelector callback={_.curry(setOurIngredientsAtIdx)(0)} value={ourIngredients[0]} />
    <IngredientSelector callback={_.curry(setOurIngredientsAtIdx)(1)} value={ourIngredients[1]} />
    <CheckboxSelector values={possibleResults} itemList={_.keys(potions)} imageDir="potions" callback={flipPossibleResultsBit} />
  </FactDialog>
}

function AddOneIngredientFactDialog({handleSubmit}) {
  const [ingredient, setIngredient] = React.useState(0)
  const [aspects, flipAspectsBit] = useFlipBitsArrayState(6)
  const [bayesMode, setBayesMode] = React.useState(false)

  const imageDir = bayesMode ? "potions" : "aspects"

  let disableReason
  if (_.every(aspects)) {
    disableReason = "deselect at least one aspect"
  }
  if (_.every(aspects, _.negate(_.identity))) {
    disableReason = "select at least one aspect"
  }

  return <FactDialog
    buttonLabel="Add new One-Ingredient Fact"
    handleSubmit={() => handleSubmit(new OneIngredientFact(ingredient, aspects, bayesMode))}
    disableReason={disableReason}
  >
    <IngredientSelector callback={setIngredient} value={ingredient} />
    <CheckboxSelector values={aspects} itemList={_.keys(potions).slice(0,6)} imageDir={imageDir} callback={flipAspectsBit} />
    {/* TODO Sometimes when the below is clicked (too quickly?), the above fails to update images and they disappear instead */}
    <Checkbox checked={bayesMode} onChange={() => setBayesMode(!bayesMode)}>Bayes Mode</Checkbox>
  </FactDialog>
}

// The values are irrelevant as long as they're distinct
const RIVAL_MENU_RIGHT = "right"
const RIVAL_MENU_GUESS = "guess"
const RIVAL_MENU_RED = "red"
const RIVAL_MENU_GREEN = "green"
const RIVAL_MENU_BLUE = "blue"
const RIVAL_MENU_BUNK = "bunk"
const presetDefs = {
  [RIVAL_MENU_RIGHT]: [60, 5, 5, 5, 2, 2, 2, 1],
  [RIVAL_MENU_GUESS]: [1, 1, 1, 1, 1, 1, 1, 1],
  [RIVAL_MENU_RED]: [20, 20, 2, 2, 1, 2, 2, 1],
  [RIVAL_MENU_GREEN]: [20, 2, 20, 2, 2, 1, 2, 1],
  [RIVAL_MENU_BLUE]: [20, 2, 2, 20, 2, 2, 1, 1],
  [RIVAL_MENU_BUNK]: [1, 5, 5, 5, 25, 25, 25, 10]
}
function AddRivalPublicationDialog({handleSubmit}) {
  const [ingredient, setIngredient] = React.useState(0)
  const [alchemical, setAlchemical] = React.useState(0)
  const [odds, setOdds, setOddsAtIdx] = useArrayState([1,1,1,1,1,1,1,1])

  const ourHandleSubmit = () => {
    if (_.findIndex(odds, (value) => value === 0) !== -1) {
      Modal.warning({
        title: 'Warning',
        content: 'Using 0 in an odds ratio implies utter certainty: no future evidence, however strong, can change your mind. Proceed at your own risk.',
      })
    }
    handleSubmit(new RivalPublicationFact(ingredient, alchemical, odds))
  }

  const menu =
    <Menu onClick={(e) => setOdds(presetDefs[e.key])}>
      <Menu.Item key={RIVAL_MENU_GUESS}>Completely guessing</Menu.Item>
      <Menu.Item key={RIVAL_MENU_RIGHT}>Probably right</Menu.Item>
      <Menu.SubMenu title="Hedging">
        <Menu.Item key={RIVAL_MENU_RED}>Red</Menu.Item>
        <Menu.Item key={RIVAL_MENU_GREEN}>Green</Menu.Item>
        <Menu.Item key={RIVAL_MENU_BLUE}>Blue</Menu.Item>
      </Menu.SubMenu>
      <Menu.Item key={RIVAL_MENU_BUNK}>BUNK BUNK BUNK! (aka Rafi mode)</Menu.Item>
    </Menu>

  let extraChildren = _.map(odds, (value, index) =>
    <div key={index}>
      <span style={{float:"left"}}>{_.keys(correctnessOpts)[index] + ": " + value + " "}</span>
      <InputNumber
        style={{float:"right"}}
        size="small"
        min={0}
        value={odds[index]}
        onChange={_.curry(setOddsAtIdx)(index)}
      />
      <br/>
      <br/>
    </div>
  )

  return <FactDialog
    buttonLabel="Add new Rival Publication"
    handleSubmit={ourHandleSubmit}
  >
    <IngredientSelector callback={setIngredient} value={ingredient} />
    <AlchemicalSelector callback={setAlchemical} value={alchemical} />
    <div>
      <span style={{"fontWeight": 'bold'}}>Disregarding my own experiments, </span>
      <span>I think the odds are my opponent is...</span>
    </div>
    <Dropdown overlay={menu}>
      <div>
        [Mouse over to select a preset]
      </div>
    </Dropdown>
    {extraChildren}
  </FactDialog>
}

function AddLibraryFactDialog({handleSubmit}) {
  const [ingredient, setIngredient] = React.useState(0)
  const [solar, setSolar] = React.useState(true)

  return <FactDialog
    buttonLabel="Add new Library Fact"
    handleSubmit={() => handleSubmit(new LibraryFact(ingredient, solar))}
  >
    <IngredientSelector callback={setIngredient} value={ingredient}/>
    <SunMoonSelector callback={setSolar} value={solar}/>
  </FactDialog>
}

function AddGolemTestFactDialog({handleSubmit}) {
  const [ingredient, setIngredient] = React.useState(0)
  const [effects, flipEffectsBit] = useFlipBitsArrayState(2)

  return <FactDialog
    buttonLabel="Add new Golem Test Fact"
    handleSubmit={() => handleSubmit(new GolemTestFact(ingredient, effects))}
  >
    <IngredientSelector callback={setIngredient} value={ingredient}/>
    <CheckboxSelector values={effects} itemList={["ears", "chest"]} imageDir="golemTest" callback={flipEffectsBit}/>
  </FactDialog>
}

function AddGolemAnimationFactDialog({handleSubmit}) {
  const [ourIngredients, _setOurIngredients, setOurIngredientsAtIdx] = useArrayState([0,1])
  const [success, setSuccess] = React.useState(false)

  let disableReason
  if (ourIngredients[0] === ourIngredients[1]) {
    disableReason = "select two distinct ingredients"
  }

  return <FactDialog
    buttonLabel="Add new Golem Animation Fact"
    handleSubmit={() => handleSubmit(new GolemAnimationFact(ourIngredients, success))}
    disableReason={disableReason}
  >
    <IngredientSelector callback={_.curry(setOurIngredientsAtIdx)(0)} value={ourIngredients[0]} />
    <IngredientSelector callback={_.curry(setOurIngredientsAtIdx)(1)} value={ourIngredients[1]} />
    <Checkbox checked={success} onChange={() => setSuccess(!success)}>Success</Checkbox>
  </FactDialog>
}

/////////////////////////////////
// Selectors used by fact dialogs
/////////////////////////////////

function IngredientSelector({callback, value}) {
  return <Radio.Group onChange={e => callback(e.target.value)} value={value}>
    {ingredients.map((name, index) =>
      <Radio style={{display: 'inline-block'}} value={index} key={name}>
        {<MyIcon imageDir='ingredients' name={name}/>}
      </Radio>)}
  </Radio.Group>
}

function AlchemicalSelector({callback, value}) {
  return <Radio.Group onChange={e => callback(e.target.value)} value={value}>
    {alchemicals.map((name, index) =>
      <Radio style={{display: 'inline-block'}} value={index} key={index}>
        {<MyIcon imageDir='alchemicals' name={name.join("")}/>}
      </Radio>)}
  </Radio.Group>
}

function SunMoonSelector({callback, value}) {
  return <Radio.Group onChange={e => callback(e.target.value)} value={value}>
    <Radio style={{display: 'inline-block'}} value={true} key="solar">
      {<MyIcon imageDir="classes" name="solar"/>}
    </Radio>
    <Radio style={{display: 'inline-block'}} value={false} key="lunar">
      {<MyIcon imageDir="classes" name="lunar"/>}
    </Radio>
  </Radio.Group>
}

export {AddOneIngredientFactDialog, AddTwoIngredientFactDialog,
  AddLibraryFactDialog, AddGolemTestFactDialog, AddGolemAnimationFactDialog,
  AddRivalPublicationDialog}
