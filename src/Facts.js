import _ from 'lodash'

import React from 'react'
import {View, Text} from 'react-native'

import {potions, potionsInverted, ingredients, alchemicals, correctnessOpts} from './Enums.js'
import {MyIcon} from './MyIcon.js'
import {mixInWorld} from './Logic.js'


class Fact {
  updatePrior(weightedWorld) {
    throw new Error("updatePrior not defined for this fact type")
  }
  mentionedIngredients() {
    throw new Error("mentionedIngredients not defined for this fact type")
  }
}

//////////////////////
// Specific Fact types:
//////////////////////

class GolemTestFact extends Fact {
  constructor(ingredient, effects) {
    super()
    this.ingredient = ingredient
    this.effects = effects
  }

  updatePrior = (weightedWorld) => {
    const alchemical = alchemicals[weightedWorld.ingAlcMap[this.ingredient]]
    const sizes = [0,0,0]
    for (let i = 0; i < 3; i++) {
      sizes[i] = alchemical[i] === alchemical[(i+1) % 3] ? 1 : -1
    }
    weightedWorld.golemMaps = _.filter(weightedWorld.golemMaps, (golemMap) => {
      for (let aspect = 0; aspect < 3; aspect++) {
        const effect = golemMap[aspect]
        if (effect === 'nothing') {
          continue
        }
        const effectIndex = _.findIndex(['ears', 'chest'], (value) => value === effect.affects)
        if ((effect.size === sizes[aspect]) !== this.effects[effectIndex]) {
          return false
        }
      }
      return true
    })
  }

  mentionedIngredients = () => [this.ingredient]

  render = () => {
    return <View style={{flexDirection:'row', flexWrap:'wrap'}}>
      <MyIcon imageDir='ingredients' name={ingredients[this.ingredient]}/>
      <Text>→</Text>
      <MyIcon imageDir='golemTest' name={this.effects.join('')}/>
    </View>
  }
}

class GolemAnimationFact extends Fact {
  constructor(ingredients, success) {
    super()
    this.ingredients = ingredients
    this.success = success
  }

  updatePrior = (weightedWorld) => {
    const alchemical0 = alchemicals[weightedWorld.ingAlcMap[this.ingredients[0]]]
    const alchemical1 = alchemicals[weightedWorld.ingAlcMap[this.ingredients[1]]]
    const aspects = _.zipWith(alchemical0, alchemical1, (a, b) => (a+b)/2)
    weightedWorld.golemMaps = _.filter(weightedWorld.golemMaps, (golemMap) => {
      const worldAspects = _.map(golemMap, (affect) => {
        if (affect === 'nothing') {
          return 0
        } else {
          return affect.size
        }
      })
      return this.success === _.isEqual(aspects, worldAspects)
    })
  }

  mentionedIngredients = () => this.ingredients

  render = () => {
    return <View style={{flexDirection:'row', flexWrap:'wrap'}}>
      <MyIcon imageDir='ingredients' name={ingredients[this.ingredients[0]]}/>
      <Text>+</Text>
      <MyIcon imageDir='ingredients' name={ingredients[this.ingredients[1]]}/>
      {this.success ? "animates the golem!" : "fails to animate the golem"}
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
    const world = weightedWorld.ingAlcMap
    const alchemical = alchemicals[world[this.ingredient]]
    const isSolar = _.filter(alchemical, (value) => (value === -1)).length % 2 === 0
    if (isSolar !== this.isSolar) {
      weightedWorld.multiplicity = 0
    }
  }

  mentionedIngredients = () => [this.ingredient]

  render = () => {
    return <View style={{flexDirection:'row', flexWrap:'wrap'}}>
      <MyIcon imageDir='ingredients' name={ingredients[this.ingredient]}/>
      <Text>∈</Text>
      {this.isSolar ? <MyIcon imageDir="classes" name="solar"/> : <MyIcon imageDir="classes" name="lunar"/>}
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
    const world = weightedWorld.ingAlcMap
    const alchemical = alchemicals[world[this.ingredient]]
    let likelihoodFactor = 0
    for (let aspectIndex = 0; aspectIndex < this.setOfAspects.length; aspectIndex++) {
      if (this.setOfAspects[aspectIndex]) {
        const aspect = _.values(potions)[aspectIndex]
        for (let color = 0; color < 3; color++) {
          if (aspect[color] === alchemical[color]) {
            if (this.bayesMode) {
              likelihoodFactor += 1
            } else {
              return //The world is possible, so don't change anything
            }
          }
        }
      }
    }
    weightedWorld.multiplicity *= likelihoodFactor
  }

  mentionedIngredients = () => [this.ingredient]

  render = () => {
    const aspectNames = _.filter(_.keys(potions), (name, index) => this.setOfAspects[index])

    let text
    let imageDir
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
      <Text>{text}</Text>
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
    const result = mixInWorld(weightedWorld, this.ingredients)
    const potionIndex = potionsInverted["" + result]
    weightedWorld.multiplicity *= this.possibleResults[potionIndex]
  }

  mentionedIngredients = () => this.ingredients

  render = () => {
    const numTrue = _.filter(this.possibleResults).length
    let potionNames = _.keys(potions)

    if (numTrue === potionNames.length - 1) {
      const potionName = potionNames[_.findIndex(this.possibleResults, _.negate(_.identity))]
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
      <Text>+</Text>
      <MyIcon imageDir='ingredients' name={ingredients[this.ingredients[1]]}/>
      <Text>{seperator}</Text>
      {potionList.map((name, index) => <MyIcon imageDir='potions' name={name} key={index}/>)}
    </View>
  }
}

class RivalPublicationFact extends Fact {
  constructor(ingredient, alchemical, odds) {
    super()
    this.ingredient = ingredient
    this.alchemical = alchemical
    this.odds = odds
  }

  updatePrior = (weightedWorld) => {
    const actualAlchemical = weightedWorld.ingAlcMap[this.ingredient]
    const diff = _.zipWith(alchemicals[this.alchemical], alchemicals[actualAlchemical], (a, b) => a === b)
    const i = _.findIndex(_.values(correctnessOpts), x => _.isEqual(x, diff))
    weightedWorld.multiplicity *= this.odds[i]
  }

  mentionedIngredients = () => [this.ingredient]

  render = () => {
    return <View style={{flexDirection:'row', flexWrap:'wrap'}}>
      <MyIcon imageDir='ingredients' name={ingredients[this.ingredient]}/>
      <Text>was published as</Text>
      <MyIcon imageDir='alchemicals' name={alchemicals[this.alchemical].join("")}/>
      ({_.map(this.odds, (value, key) => value).join(",")})
    </View>
  }
}

export {GolemTestFact, GolemAnimationFact, LibraryFact,
  OneIngredientFact, TwoIngredientFact, RivalPublicationFact}
