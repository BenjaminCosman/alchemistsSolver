import React from 'react'

import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'

class HelpDialog extends React.Component {
  state = {
      open: false,
  }
  handleOpen = () => this.setState({open: true})
  handleClose = () => this.setState({open: false})
  render() {
    const actions = [
      <FlatButton
        label="OK"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleClose}
      />,
    ]

    return (
      <div>
        <RaisedButton label="Help" onTouchTap={this.handleOpen} />
        <Dialog
          open={this.state.open}
          onRequestClose={this.handleClose}
          actions={actions}
          title="Usage"
          autoScrollBodyContent={true}
        >
        <h3>Overview</h3>
        <br/>
        This app takes in things you learn during the game (primarily
        experimental results), and helps you figure out what to publish, what
        further experiments to do, etc. (We assume you already know
        the <a href="http://czechgames.com/en/alchemists/downloads/">rules of Alchemists</a>.)
        <br/>
        <br/>
        <h3>Data Input (top of screen)</h3>
        <br/>
        <h4>Two-Ingredient Facts:</h4>
        When you mix a potion, enter the results as a Two-Ingredient Fact. Select
        all potions that you might have made, e.g. if you try to sell a Red- to the
        adventurer and get the "wrong sign" result, select all three plus potions.
        You can also use this to enter the results of Master-Variant debunking.
        <br/>
        <br/>
        <h4>One-Ingredient Facts:</h4>
        A One-Ingredient Fact says the given ingredient has at least
        one of the given aspects. This is useful when you observe one ingredient
        of a potion using Periscope, or for Apprentice-Variant debunking. For example,
        if an opponent mixes a "red or green plus" potion for the adventurer and you
        Periscope an ingredient, check off both red+ and green+.
        <h5>Bayes Mode</h5>
        In normal mode, a fact simply treats worlds as possible or
        impossible. However sometimes you can infer more: for example, if you learn
        by Periscope that the Fern was used to make an unknown Plus potion, the only
        alchemical that you can outright eliminate is the triple-Minus, but it is more likely
        that the Fern is the triple-Plus than anything else. Check the Bayes Mode
        box if you want this extra information taken into account.
        <br/>
        <br/>
        <h4>(Expansion only) Other Facts:</h4>
        Library, Golem Test, and Golem Animation Facts work similarly to the above.
        <br/>
        <br/>
        <h3>Publishing Tab</h3>
        <br/>
        <h4>Remaining Worlds:</h4>
        Your world is described by the true mapping between ingredients and alchemicals.
        At the beginning of the game any mapping is possible, so there are 8 factorial (40320) worlds you
        could be in. This counter tracks how many are still possible.
        <br/>
        <br/>
        <h4>The Table:</h4>
        Each cell tells you the probability its ingredient maps to its
        alchemical (rounded to the nearest percentage point). This is simply the fraction
        of remaining worlds that have that mapping (possibly weighted by Bayes Mode facts).
        <br/>
        <br/>
        <h3>Experiment Optimizer Tab</h3>
        <br/>
        <h4>Ingredients</h4>
        A list of all pairs of ingredients you can mix into potions. TODO You can
        filter out individual ingredients (e.g. ones you don't have in your hand
        at the moment).
        <br/>
        <br/>
        <h4>New Starred Theory Chance</h4>
        The chance (as a percentage) that after performing this experiment you
        can uniquely identify at least one new ingredient's alchemical.
        <br/>
        <br/>
        <h4>New Total Theory Chance</h4>
        The chance that after performing this experiment you
        can identify one new ingredient's alchemical to within two options that
        differ in only one aspect (so you can safely publish a hedged theory).
        </Dialog>
      </div>
    )
  }
}

export default HelpDialog
