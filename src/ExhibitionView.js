import {ingredients} from './Enums.js'
import {mixInWorld} from './Logic.js'
import {MyIcon} from './MyIcon.js'
import {worldWeight, flipBit, partitionWeight} from './Logic.js'
import {CheckboxSelector} from './Misc.js'

import React from 'react'

import _ from 'lodash'
import {round} from 'mathjs'

import Table from 'antd/lib/table'
import 'antd/dist/antd.css'

function ExhibitionView({worlds}) {
  const [sortedInfo, setSortedInfo] = React.useState({})
  const [stateIngredients, setStateIngredients] = React.useState([false, false, false, false, false, false, false, false])

  const myIngredients = _.keys(ingredients).filter(idx => stateIngredients[idx])

  let rows = []
  _.forEach(myIngredients, (ingredient1) => {
    _.forEach(myIngredients, (ingredient2) => {
      _.forEach(myIngredients, (ingredient3) => {
        _.forEach(myIngredients, (ingredient4) => {
          if (ingredient1 < ingredient2
           && ingredient3 < ingredient4
           && ingredient1 < ingredient3
           && ingredient2 !== ingredient3
           && ingredient2 !== ingredient4) {
            let success = 0
            _.forEach(worlds, (weightedWorld) => {
              const potion1 = mixInWorld(weightedWorld, [ingredient1, ingredient2])
              const potion2 = mixInWorld(weightedWorld, [ingredient3, ingredient4])
              if (_.sum(potion1) !== 0 && _.every(_.zipWith(potion1, potion2, (a,b) => a+b), v => v === 0)) {
                success += worldWeight(weightedWorld)
              }
            })

            const denominator = partitionWeight(worlds)
            rows.push({
              ingredients:[ingredient1, ingredient2, ingredient3, ingredient4],
              mixSuccess:success/denominator,
            })
          }
        })
      })
    })
  })

  const columns = [{
    title: 'Ingredients to mix',
    dataIndex: 'ingredients',
    render: ings => <>
      <div style={{display: "inline-block"}}><MyIcon imageDir="ingredients" name={ingredients[ings[0]]}/></div>
      <div style={{display: "inline-block"}}><MyIcon imageDir="ingredients" name={ingredients[ings[1]]}/></div>
      and
      <div style={{display: "inline-block"}}><MyIcon imageDir="ingredients" name={ingredients[ings[2]]}/></div>
      <div style={{display: "inline-block"}}><MyIcon imageDir="ingredients" name={ingredients[ings[3]]}/></div>
    </>,
    // filteredValue: filteredInfo.ingredients,
    width: 150,
  }, {
    title: 'Chance of +/-',
    dataIndex: 'mixSuccess',
    sorter: (a, b) => a.mixSuccess - b.mixSuccess,
    sortOrder: sortedInfo.columnKey === 'mixSuccess' && sortedInfo.order,
    render: chance => round(chance*100, 0),
    width: 150,
  }]

  return <>
    <div>Your hand:</div>
    <CheckboxSelector
      values={stateIngredients}
      itemList={ingredients}
      imageDir="ingredients"
      callback={(index) => setStateIngredients(flipBit(stateIngredients, index))}
    />,
    <Table
      columns={columns}
      dataSource={rows}
      rowKey={record => record.ingredients}
      pagination={false}
      size="small"
      onChange={(pagination, filters, sorter) => setSortedInfo(sorter)}
      scroll={{ y: 300 }}
    />
    Scroll on table to see more results.
  </>
}

export {ExhibitionView}
