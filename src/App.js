// === UI stuff ===
//TODO add refresh indicators http://www.material-ui.com/#/components/refresh-indicator
//TODO downsize columns (and rows)

// === Additional views ===
//TODO add view to see individual worlds when you have just a few
//TODO add view for best things to mix for the adventurer

// === Refactoring ===
//TODO split up FactDialogs.js

// === Other stuff ===
//TODO make Facts into React Components
//TODO fix lag issues
//TODO get test file working
//TODO (periodically?) filter package.json unneeded packages

import ExpansionSelectorDialog from './ExpansionSelectorDialog.js'
import {AddTwoIngredientFactDialog, AddOneIngredientFactDialog, AddLibraryFactDialog, AddGolemTestFactDialog, AddRivalPublicationDialog} from './FactDialogs.js'
import {PublishView} from './PublishView.js'
import {OptimizerView} from './OptimizerView.js'
import AboutDialog from './AboutDialog.js'
import HelpDialog from './HelpDialog.js'
import {worldGenerator} from './WorldGenerator.js'

import {Tabs, Tab} from 'material-ui/Tabs';

import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'

import React from 'react'
import {View} from 'react-native'
import './App.css'

import _ from 'lodash'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()


const style = {
  margin: 12,
}

class AlchemistsSolverApp extends React.PureComponent {
  state = {
    golemMode: false,
    factlist: [],
  }
  handleSubmit = (newFact) => {
    this.setState({
      factlist: this.state.factlist.concat([newFact]),
    })
  }
  render() {
    let worlds = worldGenerator(this.state.golemMode)

    _.forEach(this.state.factlist, (fact) => {
      _.forEach(worlds, fact.updatePrior)
      worlds = _.filter(worlds, (world) => world.multiplicity !== 0)
    })

    let expansionFactDialogs = []
    if (this.state.golemMode) {
        expansionFactDialogs = [
          <AddLibraryFactDialog handleSubmit={this.handleSubmit} key={0}/>,
          <AddGolemTestFactDialog handleSubmit={this.handleSubmit} key={1}/>,
          <FlatButton label="Add Golem Animation Fact (Coming soon!)" disabled={true} key={2}/>,
        ]
    }

    let views
    if (worlds.length === 0) {
      views = <div>
        <h1>Your facts are contradictory.</h1>
        Check them and delete any you may have entered incorrectly, or read the
        Help section to make sure you know the format and meaning of the facts.
      </div>
    } else {
      views = <Tabs>
        <Tab label="Publishing" >
          <PublishView worlds={worlds} />
        </Tab>
        <Tab label="Experiment Optimizer" >
          <OptimizerView worlds={worlds} />
        </Tab>
      </Tabs>
    }

    return (
      <MuiThemeProvider>
        <div>
          <ExpansionSelectorDialog callback={() => this.setState({golemMode:true})}/>
          <HelpDialog/>
          <AboutDialog/>

          <ul>
            {this.state.factlist.map((fact, factIndex) => <ReactFact key={factIndex} item={fact.render()} deleteFact={() => {this.deleteFact(factIndex)}} />)}
          </ul>
          <AddTwoIngredientFactDialog handleSubmit={this.handleSubmit}/>
          <AddOneIngredientFactDialog handleSubmit={this.handleSubmit}/>
          <AddRivalPublicationDialog handleSubmit={this.handleSubmit}/>
          {expansionFactDialogs}

          {views}
        </div>
      </MuiThemeProvider>
    )
  }
  deleteFact = (deleteIndex) => {
    this.setState({factlist: removeAtIndex(this.state.factlist, deleteIndex)})
  }
}

function ReactFact(props) {
  return <li>
    <View style={{flexDirection:'row', flexWrap:'wrap'}}>
      {props.item}
      <RaisedButton onTouchTap={props.deleteFact} style={style}>Delete</RaisedButton>
    </View>
  </li>
}

// non-mutating
function removeAtIndex(arr, index) {
  return _.filter(arr, function(val, idx) {return idx !== index})
}

export default AlchemistsSolverApp
