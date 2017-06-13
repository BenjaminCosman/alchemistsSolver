import {potions, alchemicals} from './Enums.js'
import {MyIcon} from './MyIcon.js'
import {worldWeight} from './App.js'
import {toPercentageString} from './Misc.js'

import React from 'react'

import math from 'mathjs'
import _ from 'lodash'

import Table from 'antd/lib/table'


const ENC_CERTAIN = 0
const ENC_HEDGE = 1
const ENC_NONE = 2

function classify(row) {
  const pluses = _.filter(row, v => v === 1).length
  const minuses = _.filter(row, v => v === 0).length
  if (pluses >= 2 && minuses >= 2) { // you can also publish 4-0, but then you actually know 4-4
    return ENC_CERTAIN
  } else if (pluses + minuses >= 3) {
    return ENC_HEDGE
  }
  return ENC_NONE
}

function display(cellInfo, sealStrength) {
  let extra = <div/>
  if (cellInfo === 0 || cellInfo === 1) {
    if (sealStrength === ENC_CERTAIN) {
      extra = <div style={{display: 'inline-block'}}><MyIcon imageDir="seals" name="gold"/></div>
    } else if (sealStrength === ENC_HEDGE) {
      extra = <div style={{display: 'inline-block'}}><MyIcon imageDir="seals" name="gray"/></div>
    }
  }

  return <div>{toPercentageString(cellInfo)}{extra}</div>
}

function EncyclopediaView(props) {
  const data = _.map(tableInfo(props.worlds), (row, index) => {
    let v = _.toPlainObject(row)
    v.index = index
    v.hedge = classify(row)
    return v
  })

  let columns = _.keys(alchemicals).map((name, index) =>
    ({
      title: index,
      dataIndex: index,
      key: name,
      width: 150,
      render: (chance, row) => display(chance, row.hedge)
    })
  )
  columns.unshift({
    title: <div/>,
    dataIndex: "index",
    key: "icon",
    width: 150,
    render: index => <MyIcon imageDir="aspects" name={_.keys(potions)[index*2]} />
  })

  return <div>
    <h2>Encyclopedia</h2>
    <Table
      columns={columns}
      dataSource={data}
      rowKey={record => record.index}
      pagination={false}
      size={"small"}
      showHeader={false}
    />
  </div>
}

function tableInfo(worlds) {
  let result = [
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
  ]
  let denominator = 0

  _.forEach(worlds, (world) => {
    denominator += worldWeight(world)
    _.forEach(world.ingAlcMap, (alchemical, ingredient) => {
      _.forEach(alchemicals[alchemical], (sign, aspectIndex) => {
        if (sign === +1) {
          result[aspectIndex][ingredient] += worldWeight(world)
        }
      })
    })
  })

  return math.dotMultiply(result, 1/denominator)
}

function encyclopediaTheories(worlds) {
  let hedge = 0
  let certain = 0
  _.forEach(tableInfo(worlds), (row) => {
    const result = classify(row)
    if (result === ENC_CERTAIN) {
      certain++
    } else if (result === ENC_HEDGE) {
      hedge++
    }
  })
  return [certain, hedge]
}

export {EncyclopediaView, encyclopediaTheories}
