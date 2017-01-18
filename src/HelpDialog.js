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
        <h4>Rival Publications:</h4>
        When an opponent publishes a theory, you can enter it here. If you choose to enter
        probabilities other than the "Completely Guessing" default, your chart will
        be updated accordingly. Try to enter probabilities only based on what you
        know of your opponent's situation and personality, and NOT based on your own
        experiments, since the probability calculator will take your experiments
        into account for you and you should not double-count that evidence.
        If you do not make the chances sum to 100 percent, they will be scaled for you.
        COMING SOON:
        Entering publications here will also allow you to filter them out of the
        Experiment Optimizer in case you only want to publish something new, not endorse.
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
        <h4>Ingredients to mix</h4>
        A list of all pairs of ingredients you can mix into potions. You can
        use the filter to include e.g. only the ones in your hand
        at the moment.
        <br/>
        <br/>
        <h4>Starred Theory Chance</h4>
        The chance (as a percentage) that after performing this experiment you
        can uniquely identify at least one new ingredient's alchemical.
        <br/>
        <br/>
        <h4>Total Theory Chance</h4>
        The chance that after performing this experiment you
        can identify one new ingredient's alchemical to within two options that
        differ in only one aspect (so you can safely publish a hedged theory).
        Does NOT include the chance that a formerly-hedgable theory becomes
        certain.
        <br/>
        <br/>
        <h4>Shannon Entropy</h4>
        Higher is better - roughly, if an experiment scores x bits of entropy
        you can expect it to cut the number of possible worlds by a factor of
        2^x. (E.g. your first experiment of the game will cut by a factor of
        2^2.8 = 7). In particular, entropy of 0 means you will learn nothing from
        the experiment (and by default such rows are filtered out of the table).
        <br/>
        <br/>
        <h4>Mix success</h4>
        The chance that you will make one of the potions you want to make
        (select them in it's filter menu).
        </Dialog>
      </div>
    )
  }
}

export default HelpDialog
