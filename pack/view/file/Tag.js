import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui'

const textToHue = (text) => {
  let hue = 0
  for (let index = 0, indexMax = text.length; index < indexMax; index++) hue += Math.pow(text.charCodeAt(index), 4)
  return hue % 360
}
const TagComponent = ({ text, classes }) => <b className={classes.tag} style={{ background: `hsl(${textToHue(text)}, 100%, 85%)` }}>{text}</b>
TagComponent.propTypes = {
  text: PropTypes.string,
  classes: PropTypes.object.isRequired
}
const Tag = withStyles((theme) => ({
  tag: {
    display: 'inline-block',
    overflow: 'visible',
    flex: '0 0 24px',
    padding: '1px',
    width: '24px',
    height: '24px',
    borderRadius: '2px',
    fontSize: '10px',
    lineHeight: '10px',
    wordBreak: 'break-all'
  }
}))(TagComponent)

const cachedTagMap = {}
const getTag = (tagText) => (cachedTagMap[ tagText ] || (cachedTagMap[ tagText ] = <Tag text={tagText} />))

export { getTag }
