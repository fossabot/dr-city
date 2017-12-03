import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Card, CardHeader, List, ListItem, ListItemIcon, ListItemText, IconButton, Icon, Typography, Divider } from 'material-ui'

class FileList extends PureComponent {
  static propTypes = {
    routePrefix: PropTypes.string.isRequired,
    relativePath: PropTypes.string.isRequired,
    directoryList: PropTypes.array.isRequired,
    fileList: PropTypes.array.isRequired,
    // isEditable: PropTypes.bool,
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
</ListItem>

const renderItemFile = (linkUri, linkText, onClick) => <ListItem key={linkUri} onClick={onClick} button>
  <ListItemIcon><Icon>insert_drive_file</Icon></ListItemIcon>
  <ListItemText primary={<Typography noWrap>{linkText}</Typography>} />
</ListItem>

export { FileList }
