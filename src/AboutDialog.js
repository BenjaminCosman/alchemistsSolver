import React from 'react'

import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'

class AboutDialog extends React.PureComponent {
  state = {
      open: true,
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
        <RaisedButton label="About" onTouchTap={this.handleOpen} />
        <Dialog
          open={this.state.open}
          onRequestClose={this.handleClose}
          actions={actions}
          title="Alchemists Solver"
        >
        {/* TODO: Change to Matúš */}
        A helper app for <a href="http://czechgames.com/en/alchemists/">Alchemists</a>,
        Matus Kotry's board game of logic, worker placement, and academic pride.
        All images belong to the game publishers.
        <br/>
        <br/>
        by Rafael and Benjamin Cosman
        </Dialog>
      </div>
    )
  }
}

export default AboutDialog
