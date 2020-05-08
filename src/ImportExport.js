import {GolemTestFact, GolemAnimationFact, LibraryFact, OneIngredientFact,
  TwoIngredientFact, RivalPublicationFact} from './Facts.js'

import React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'

import Modal from 'antd/lib/modal'
import Button from 'antd/lib/button'

import querystring from 'querystring'
import _ from 'lodash'

// TODO this system of using the class names as strings seems really fragile?
// But it's less fragile than using e.g. [class].constructor.name, since
// class names are changed during minification
function typeString(fact) {
  if (fact instanceof TwoIngredientFact) {
    return "TwoIngredientFact"
  } else if (fact instanceof OneIngredientFact) {
    return "OneIngredientFact"
  } else if (fact instanceof RivalPublicationFact) {
    return "RivalPublicationFact"
  } else if (fact instanceof LibraryFact) {
    return "LibraryFact"
  } else if (fact instanceof GolemTestFact) {
    return "GolemTestFact"
  } else if (fact instanceof GolemAnimationFact) {
    return "GolemAnimationFact"
  }
}
function mkBlankFact(type) {
  switch(type) {
    case "GolemTestFact":
      return new GolemTestFact()
    case "GolemAnimationFact":
      return new GolemAnimationFact()
    case "LibraryFact":
      return new LibraryFact()
    case "OneIngredientFact":
      return new OneIngredientFact()
    case "TwoIngredientFact":
      return new TwoIngredientFact()
    case "RivalPublicationFact":
      return new RivalPublicationFact()
    default:
      console.log("unknown fact type:")
      console.log(type)
      throw new Error("fatal error on import")
  }
}

function showExportDialog(expansion, factlist) {
  let location = window.location

  let payload = {expansion: expansion}
  _.forEach(factlist, (fact, idx) => {
    payload['fact'+idx] = JSON.stringify(fact)
    payload['type'+idx] = typeString(fact)
  })

  let url = location.origin + location.pathname + "?" + querystring.stringify(payload)

  Modal.info({
    title: 'Export',
    content: <>
      URL to load this app with the current
      expansion choice and fact list:
      <br/>
      <CopyToClipboard text={url}>
        <Button>Copy to clipboard</Button>
      </CopyToClipboard>
      {url}
    </>
  })
}

function deserializeFact([type, seed]) {
  return Object.assign(mkBlankFact(type), JSON.parse(seed))
}

export {deserializeFact, showExportDialog}
