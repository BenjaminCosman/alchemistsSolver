import {alchemicals, ingredients} from './Enums.js'
import {MyIcon} from './MyIcon.js'
import {coreTableInfo, coreTheories} from './Logic.js'
import {toPercentageString} from './Misc.js'

import React from 'react'

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

  return <TableRowColumn>{toPercentageString(props.cellInfo)}{extra}</TableRowColumn>
}

function SheetRow(props) {
  return (
    <TableRow>
      <TableRowColumn><MyIcon imageDir="alchemicals" name={alchemicals[props.index].join("")} /></TableRowColumn>
      {props.rowInfo.map((cellInfo, index) => <SheetCell key={index} cellInfo={cellInfo} hedges={props.hedges} ingredient={index}/>)}
    </TableRow>
  )
}

function countWorlds(worlds) {
  return _.sumBy(worlds, (world) => world.golemMaps.length)
}

class PublishView extends React.Component {
  state = {
    summary: true,
    currentWorld: 0
  }

  componentWillReceiveProps(nextProps) {
    // reset to Summary mode if worlds changes (as hopefully indicated by countWorlds)
    if (countWorlds(this.props.worlds) !== countWorlds(nextProps.worlds)) {
      this.setState({summary: true, currentWorld: 0})
    }
  }

  render() {
    let worlds = this.props.worlds
    let worldTracker
    if (this.state.summary) {
      worldTracker = <div>
        Remaining worlds: {countWorlds(worlds)}
        <Button size="small" onClick={() => this.setState({summary: false})}>Explore</Button>
      </div>
    } else {
      const total = countWorlds(worlds)
      // TODO Broken for golem expansion because +/- advances one full world object, which is actually several golem worlds
      // Also, should affect other publish views too (e.g. EncyclopediaView)?
      worldTracker = <div>
        {"World " + (1+this.state.currentWorld) + " of " + total}
        <Button size="small" onClick={() => this.setState({summary: true})}>Summary</Button>
        <Button size="small" onClick={() => this.setState({currentWorld: (this.state.currentWorld - 1 + total) % total})}>-</Button>
        <Button size="small" onClick={() => this.setState({currentWorld: (this.state.currentWorld + 1) % total})}>+</Button>
      </div>
      worlds = [this.props.worlds[this.state.currentWorld]]
    }

    const data = coreTableInfo(worlds)

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
            {data.map((rowInfo, index) => <SheetRow key={index} rowInfo={rowInfo} index={index} hedges={coreTheories(data)[1]}/>)}
          </TableBody>
        </Table>
      </div>
    )
  }
}

export {PublishView}
