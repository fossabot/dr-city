import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  Card, CardHeader,
  List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction,
  IconButton, Icon, Typography, Divider
} from 'material-ui'

class FileListEditable extends PureComponent {
  static propTypes = {
    routePrefix: PropTypes.string.isRequired,
    relativePath: PropTypes.string.isRequired,
    directoryList: PropTypes.array.isRequired,
    fileList: PropTypes.array.isRequired,
    toDirectory: PropTypes.func.isRequired,
    toFile: PropTypes.func.isRequired
  }

  render () {
    const { routePrefix, relativePath, directoryList, fileList, /* isEditable, */ toDirectory, toFile } = this.props
    const relativeRoute = relativePath ? `${routePrefix}/${relativePath}` : routePrefix

    __DEV__ && console.log('[FileList] render', this.props)

    return <Card>
      <CardHeader title={`/${relativePath}`} avatar={relativePath === ''
        ? <IconButton disabled>label_outline</IconButton>
        : <IconButton onClick={() => toDirectory(`${relativePath}/..`)}>arrow_back</IconButton>
      } />
      <Divider />
      <List dense>
        {directoryList.map((name) => renderItemDirectory(`${relativeRoute}/${name}`, name, () => toDirectory(`${relativePath}/${name}`)))}
        {fileList.map((name) => renderItemFile(`${relativeRoute}/${name}`, name, () => toFile(`${relativeRoute}/${name}`, name)))}
      </List>
    </Card>
  }
}

const renderItemDirectory = (linkUri, linkText, onClick) => <ListItem key={linkUri} onClick={onClick} button>
  <ListItemIcon><Icon>folder_open</Icon></ListItemIcon>
  <ListItemText primary={<Typography noWrap>{linkText}</Typography>} />
  <ListItemSecondaryAction><IconButton>more_vert</IconButton></ListItemSecondaryAction>
</ListItem>

const renderItemFile = (linkUri, linkText, onClick) => <ListItem key={linkUri} onClick={onClick} button>
  <ListItemIcon><Icon>description</Icon></ListItemIcon>
  <ListItemText primary={<Typography noWrap>{linkText}</Typography>} />
  <ListItemSecondaryAction><IconButton>more_vert</IconButton></ListItemSecondaryAction>
</ListItem>

export { FileListEditable }
