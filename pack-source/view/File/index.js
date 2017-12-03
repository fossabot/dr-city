import React from 'react'
import PropTypes from 'prop-types'
import { ROUTE_MAP } from 'pack-source/__utils__'
import { FilePanel } from './FilePanel'

const ShareFile = ({ relativePath, dispatch }) => <FilePanel {...{
  relativePath,
  dispatch,
  isAuth: false,
  taskUrl: ROUTE_MAP.TASK_FILE_LIST_SHARE,
  viewRoute: ROUTE_MAP.VIEW_FILE
}} />

const UserFile = ({ relativePath, dispatch }) => <FilePanel {...{
  relativePath,
  dispatch,
  isAuth: true,
  taskUrl: ROUTE_MAP.AUTH_TASK_FILE_LIST_USER,
  viewRoute: ROUTE_MAP.AUTH_VIEW_USER_FILE
}} />

ShareFile.propTypes = UserFile.propTypes = {
  relativePath: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired
}

export { ShareFile, UserFile }
