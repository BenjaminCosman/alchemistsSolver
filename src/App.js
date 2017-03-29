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

import {showExpansionDialog} from './ExpansionSelectorDialog.js'
import {AddTwoIngredientFactDialog, AddOneIngredientFactDialog, AddLibraryFactDialog, AddGolemTestFactDialog, AddRivalPublicationDialog} from './FactDialogs.js'
import {PublishView} from './PublishView.js'
import {EncyclopediaView} from './EncyclopediaView.js'
import {OptimizerView} from './OptimizerView.js'
import {showAboutDialog} from './AboutDialog.js'
import {showHelpDialog} from './HelpDialog.js'
import {worldGenerator} from './WorldGenerator.js'
import './App.css'

import Tabs from 'antd/lib/tabs';
import Button from 'antd/lib/button';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import enUS from 'antd/lib/locale-provider/en_US';
import LocaleProvider from 'antd/lib/locale-provider'

import _ from 'lodash'

import React from 'react'
import {View} from 'react-native'
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()


const TabPane = Tabs.TabPane;

const style = {
  margin: 12,
}

function worldWeight(world) {
  return world.multiplicity * world.golemMaps.length
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
  componentDidMount() {
    //The about dialog is the first you see since it's the last to appear
    showExpansionDialog(() => this.setState({golemMode:true}))
    showAboutDialog()
  }
  render() {
    let worlds = worldGenerator(this.state.golemMode)

    _.forEach(this.state.factlist, (fact) => {
      _.forEach(worlds, fact.updatePrior)
      worlds = _.filter(worlds, (world) => worldWeight(world) !== 0)
    })

    let expansionFactDialogs = []
    if (this.state.golemMode) {
        expansionFactDialogs = [
          <AddLibraryFactDialog handleSubmit={this.handleSubmit} key="Library"/>,
          <AddGolemTestFactDialog handleSubmit={this.handleSubmit} key="GolemTest"/>,
          <Button disabled key="GolemAnimate">Add Golem Animation Fact (Coming soon!)</Button>,
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
      let expansionPublishViews = []
      if (this.state.golemMode) {
        expansionPublishViews = [<EncyclopediaView worlds={worlds} key={0}/>]
      }
      views = <Tabs>
        <Tabs.TabPane tab="Publishing" key="Publishing">
          <PublishView worlds={worlds} />
          {expansionPublishViews}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Experiment Optimizer" key="Experiment Optimizer">
          <OptimizerView worlds={worlds} />
        </Tabs.TabPane>
      </Tabs>
    }

    return (
      <LocaleProvider locale={enUS}>
        <MuiThemeProvider>
          <div>
            <Button onClick={showHelpDialog}>Help</Button>
            <Button onClick={showAboutDialog}>About</Button>

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
      </LocaleProvider>
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
      <Button onClick={props.deleteFact} style={style}>Delete</Button>
    </View>
  </li>
}

// non-mutating
function removeAtIndex(arr, index) {
  return _.filter(arr, function(val, idx) {return idx !== index})
}

export default AlchemistsSolverApp
export {worldWeight}
