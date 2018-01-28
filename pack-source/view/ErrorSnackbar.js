import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Snackbar, SnackbarContent, Button } from 'material-ui'

class ErrorSnackbar extends PureComponent {
  static propTypes = {
    errorList: PropTypes.array,
    dispatch: PropTypes.func
  }

  constructor (props) {
    super(props)

    this.pickError = (errorList = this.props.errorList) => {
      if (errorList.length > 6) errorList = errorList.slice(0, 6)
      // __DEV__ && console.log('[ErrorSnackbar][pickError]', errorList)
      this.setState({
        activeErrorComponentList: errorList.map(({ id, message, retryFunc }) => <SnackbarContent {...{
          key: id,
          message,
          action: retryFunc
            ? <Button color="primary" dense onClick={() => setTimeout(() => retryFunc(), 500)}>retry</Button>
            : null
        }} />)
      }, () => this.props.dispatch({ type: 'state:error:delete', payload: errorList.map(({ id }) => id) }))
    }

    this.coolDownSnackbar = (event, reason) => {
      reason !== 'clickaway' && this.setState({
        timeoutToken: setTimeout(() => {
          // __DEV__ && console.log('[ErrorSnackbar][coolDownSnackbar]')
          this.setState({ activeErrorComponentList: [], timeoutToken: null })
          this.pickError()
        }, 500)
      })
    }

    this.state = {
      activeErrorComponentList: [],
      timeoutToken: null
    }
  }

  componentDidMount () {
    // __DEV__ && console.log('[ErrorSnackbar][componentDidMount]', this.props.errorList)
    this.pickError()
  }

  componentWillReceiveProps (nextProps) {
    // __DEV__ && console.log('[ErrorSnackbar][componentWillReceiveProps]', nextProps)
    !this.state.timeoutToken && !this.state.activeErrorComponentList.length && this.pickError(nextProps.errorList)
  }

  render () {
    const { activeErrorComponentList, timeoutToken } = this.state
    __DEV__ && console.log('[ErrorSnackbar][Render]', activeErrorComponentList.length, this.props.errorList)
    return <Snackbar
      open={Boolean(!timeoutToken && activeErrorComponentList.length)}
      onClose={this.coolDownSnackbar}
      autoHideDuration={2500}
    >
      <div>{activeErrorComponentList}</div>
    </Snackbar>
  }
}

export { ErrorSnackbar }
