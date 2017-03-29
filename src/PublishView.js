import {alchemicals, ingredients} from './Enums.js'
import {MyIcon} from './MyIcon.js'
import {worldWeight} from './App.js'

import React from 'react'

import math from 'mathjs'
import _ from 'lodash'

import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import Button from 'antd/lib/button'

function SheetCell(props) {
  let extra = <div/>
  const color = props.hedges[props.ingredient]
  if (props.cellInfo === 1) {
    extra = <div style={{display: 'inline-block'}}><MyIcon imageDir="seals" name="gold"/></div>
  } else if (props.cellInfo > 0) {
    if (color !== undefined) {
      extra = <div style={{display: 'inline-block'}}><MyIcon imageDir="seals" name={color}/></div>
    }
  }

  let percentage = Math.round(props.cellInfo * 100, 0)
  if (percentage === 0 && props.cellInfo !== 0) {
    percentage = "<1"
  } else if (percentage === 100 && props.cellInfo !== 1) {
    percentage = ">99"
  }
  return <TableRowColumn>{percentage}{extra}</TableRowColumn>
}

function SheetRow(props) {
  return (
    <TableRow>
      <TableRowColumn><MyIcon imageDir="alchemicals" name={alchemicals[props.index].join("")} /></TableRowColumn>
      {props.rowInfo.map((cellInfo, index) => <SheetCell key={index} cellInfo={cellInfo} hedges={props.hedges} ingredient={index}/>)}
    </TableRow>
  )
}

class PublishView extends React.Component {
  state = {
    summary: true,
    currentWorld: 0
  }

  render() {
    let worlds = this.props.worlds
    let worldTracker
    if (this.state.summary) {
      worldTracker = <div>
        Remaining worlds: {_.sumBy(worlds, (world) => world.golemMaps.length)}
        <Button size="small" onClick={() => this.setState({summary: false})}>Explore</Button>
      </div>
    } else {
      const total = _.sumBy(worlds, (world) => world.golemMaps.length)
      // TODO: Broken for golem expansion because +/- advances one full world object, which is actually several golem worlds
      // Also, should affect other publish views too (e.g. EncyclopediaView)
      worldTracker = <div>
        {"World " + this.state.currentWorld + " of " + total}
        <Button size="small" onClick={() => this.setState({summary: true})}>Summary</Button>
        <Button size="small" onClick={() => this.setState({currentWorld: (this.state.currentWorld - 1 + total) % total})}>-</Button>
        <Button size="small" onClick={() => this.setState({currentWorld: (this.state.currentWorld + 1) % total})}>+</Button>
      </div>
      worlds = [this.props.worlds[this.state.currentWorld]]
    }


    const data = tableInfo(worlds)

    return (
      <div>
        {worldTracker}
        <Table>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn/>
              {ingredients.map((name) => <TableHeaderColumn key={name}><MyIcon imageDir="ingredients" name={name}/></TableHeaderColumn>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((rowInfo, index) => <SheetRow key={index} rowInfo={rowInfo} index={index} hedges={theories(data)[1]}/>)}
          </TableBody>
        </Table>
      </div>
    )
  }
}

function tableInfo(worlds) {
  let result = [
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
  ]

  _.forEach(worlds, (world) => {
    _.forEach(world.ingAlcMap, (alchemical, ingredient) => {
      result[alchemical][ingredient] += worldWeight(world)
    })
  })

  const denominator = _.sum(result[0])

  return math.dotMultiply(result, 1/denominator)
}

function theories(data) {
  let certainIngredients = []
  let hedgeIngredients = {}
  for (let col = 0; col < 8; col++) {
    let options = []
    for (let row = 0; row < 8; row++) {
      if (data[row][col] > 0) {
        options.push(alchemicals[row])
      }
    }
    if (options.length === 1) {
      certainIngredients.push(col)
    } else if (options.length === 2) {
      const differingAspects = _.zipWith(options[0], options[1], (a, b) => a === b ? 0 : 1)
      if (_.sum(differingAspects) === 1) {
        hedgeIngredients[col] = differingAspects.indexOf(1)
      }
    }
  }
  return [certainIngredients, hedgeIngredients]
}

export {PublishView, tableInfo, theories}
