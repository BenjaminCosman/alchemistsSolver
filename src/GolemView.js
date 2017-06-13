import {potions} from './Enums.js'
import {MyIcon} from './MyIcon.js'
import {worldWeight} from './App.js'
import {toPercentageString} from './Misc.js'

import React from 'react'

import math from 'mathjs'
import _ from 'lodash'

import Table from 'antd/lib/table'


const GOL_CERTAIN = 0
const GOL_HEDGE = 1
const GOL_NONE = 2

function classify(row) {
  let remaining = _.size(_.filter(row, v => v > 0))
  if (remaining === 1) {
    return GOL_CERTAIN
  } else if (remaining === 2) {
    return GOL_HEDGE
  }
  return GOL_NONE
}

function display(cellInfo, sealStrength) {
  let extra = <div/>
  if (cellInfo > 0) {
    if (sealStrength === GOL_CERTAIN) {
      extra = <div style={{display: 'inline-block'}}><MyIcon imageDir="seals" name="gold"/></div>
    } else if (sealStrength === GOL_HEDGE) {
      extra = <div style={{display: 'inline-block'}}><MyIcon imageDir="seals" name="gray"/></div>
    }
  }

  return <div>{toPercentageString(cellInfo)}{extra}</div>
}

function GolemView(props) {
  const data = _.map(tableInfo(props.worlds), (value, index) => {
    let v = _.toPlainObject(value)
    v.index = index
    v.hedge = classify(value)
    return v
  })

  let columns = _.slice(_.keys(potions), 0, 6).map((name, index) =>
    ({
      title: <MyIcon imageDir="coloredCircles" name={name}/>,
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
    render: index => <MyIcon imageDir="golemTest" name={['ears', 'chest'][index]} />
  })

  // //TODO same order as sheet, e.g. const names = ["Blue+", "Blue-", "Green+", "Green-", "Red+", "Red-"]
  return <div>
    <h2>Golem</h2>
    <Table
      columns={columns}
      dataSource={data}
      rowKey={record => record.index}
      pagination={false}
      size={"small"}
    />
  </div>
}

function tableInfo(worlds) {
  let result = [
    [0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0,],
  ]
  let denominator = 0

  _.forEach(worlds, (world) => {
    denominator += worldWeight(world)
    _.forEach(world.golemMaps, (golemMap) => {
      _.forEach(golemMap, (effect, index) => {
        if (effect !== 'nothing') {
          let row = effect.affects === 'ears' ? 0 : 1
          let col = 2*index + (effect.size === 1 ? 0 : 1)
          result[row][col] += world.multiplicity
        }
      })
    })
  })

  return math.dotMultiply(result, 1/denominator)
}

export {GolemView}
