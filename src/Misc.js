import {certainty} from './Enums.js'
import {MyIcon} from './MyIcon.js'

import React from 'react'

import _ from 'lodash'

function mkAntdRows(data, classifier) {
  return _.map(data, (row, index) => {
    let v = _.toPlainObject(row)
    v.index = index
    v.hedge = classifier(row)
    return v
  })
}

function mkTableCell(cellInfo, sealStrength, condition) {
  let extra = <div/>
  if (condition(cellInfo)) {
    if (sealStrength === certainty.CERTAIN) {
      extra = <div style={{display: 'inline-block'}}><MyIcon imageDir="seals" name="gold"/></div>
    } else if (sealStrength === certainty.HEDGE) {
      extra = <div style={{display: 'inline-block'}}><MyIcon imageDir="seals" name="gray"/></div>
    }
  }

  return <div>{toPercentageString(cellInfo)}{extra}</div>
}

function toPercentageString(v) {
  let percentage = Math.round(v * 100, 0)
  if (percentage === 0 && v !== 0) {
    percentage = "<1"
  } else if (percentage === 100 && v !== 1) {
    percentage = ">99"
  }
  return ""+percentage
}

export {toPercentageString, mkAntdRows, mkTableCell}
