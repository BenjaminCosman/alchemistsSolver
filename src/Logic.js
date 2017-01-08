
import _ from 'lodash'

import React from 'react'
import {View} from 'react-native'

import {potions, potionsInverted, ingredients, alchemicals, fileNames} from './Enums.js'
import {MyIcon} from './MyIcon.js'

function mixInWorld(weightedWorld, ingredients) {
  var alchemicalA = alchemicals[weightedWorld.ingAlcMap[ingredients[0]]]
  var alchemicalB = alchemicals[weightedWorld.ingAlcMap[ingredients[1]]]
  if (alchemicalA === undefined || alchemicalB === undefined) {
    console.log("ERROR: " + ingredients + " : " + weightedWorld)
  }
  return mix(alchemicalA, alchemicalB)
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

class Fact {
  updatePrior(weightedWorld) {} // Stub
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
    var result = mixInWorld(weightedWorld, this.ingredients)
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

export {GolemTestFact, LibraryFact, OneIngredientFact, TwoIngredientFact, mixInWorld}
