
import {GolemTestFact, GolemAnimationFact, LibraryFact, OneIngredientFact,
  TwoIngredientFact, RivalPublicationFact} from './Facts.js'

import _ from 'lodash'
import Cookies from 'universal-cookie'

const cookies = new Cookies()


// This module currently saves the state as a cookie that never* expires
// New saves overwrite old
// TODO this system of using the class names as strings is really fragile -
// production build BREAKS it since it changes identifiers

function saveState(state) {
  state.factlist = _.map(state.factlist, fact => {fact.type = fact.constructor.name; return fact})

  // *Set cookie to expire in the year 9999
  var d = new Date();
  d.setFullYear(9999);

  cookies.set('alchemistsState', state, {expires: d})
}

function loadState() {
  let state = cookies.get('alchemistsState')
  state.factlist = _.map(state.factlist, reconstructFact)
  return state
}

function reconstructFact(fact) {
  switch(fact.type) {
    case "GolemTestFact":
      return new GolemTestFact(fact.ingredient, fact.effects)
    case "GolemAnimationFact":
      return new GolemAnimationFact(fact.ingredients, fact.success)
    case "LibraryFact":
      return new LibraryFact(fact.ingredient, fact.isSolar)
    case "OneIngredientFact":
      return new OneIngredientFact(fact.ingredient, fact.setOfAspects, fact.bayesMode)
    case "TwoIngredientFact":
      return new TwoIngredientFact(fact.ingredients, fact.possibleResults)
    case "RivalPublicationFact":
      return new RivalPublicationFact(fact.ingredient, fact.alchemical, fact.chances)
    default:
      throw new ("unknown fact type " + fact.type)
  }
}

export {saveState, loadState}
