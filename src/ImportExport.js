import {GolemTestFact, GolemAnimationFact, LibraryFact, OneIngredientFact,
  TwoIngredientFact, RivalPublicationFact} from './Facts.js'

import _ from 'lodash'
import React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import Modal from 'antd/lib/modal'
import Button from 'antd/lib/button'

import querystring from 'querystring'

function showExportDialog(expansion, factlist) {
  let location = window.location

  let payload = {expansion: expansion}
  _.forEach(factlist, (fact, idx) => {
    payload['fact'+idx] = JSON.stringify(fact)
    payload['type'+idx] = fact.constructor.name
  })

  let url = location.origin + location.pathname + "?" + querystring.stringify(payload)

  Modal.info({
    title: 'Export',
    content: (
      <div>
        URL to load this app with the current
        expansion choice and fact list:
        <br/>
        <CopyToClipboard text={url}>
          <Button>Copy to clipboard</Button>
        </CopyToClipboard>
        {url}
      </div>
    ),
  })
}

const classDict = {
  TwoIngredientFact: TwoIngredientFact,
  OneIngredientFact: OneIngredientFact,
  RivalPublicationFact: RivalPublicationFact,
  LibraryFact: LibraryFact,
  GolemTestFact: GolemTestFact,
  GolemAnimationFact: GolemAnimationFact
}
function deserializeFact([type, seed]) {
  return Object.assign(new classDict[type](), JSON.parse(seed))
}

export {deserializeFact, showExportDialog}
