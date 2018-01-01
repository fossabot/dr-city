import React from 'react'
import PropTypes from 'prop-types'
import {
  Card, CardContent,
  Grid, Button, Icon, Typography, Divider,
  withStyles
} from 'material-ui'
import { LogStyle, MarginXS, ButtonIconLeftStyle } from 'pack-source/theme/style'
import { GridContainer } from 'pack-source/view/Layout'

const InfoComponent = ({ classes }) => <GridContainer>
  <Grid item xs={12} sm={8} lg={6}><Card>
    <InfoTopic title="GitHub:" buttonIcon="share" buttonList={[
      { text: 'dr-js/dr-city', href: 'https://github.com/dr-js/dr-city' }
    ]} classes={classes} />
    <Divider />
    <InfoTopic title="Resource:" buttonIcon="font_download" buttonList={[
      { text: 'Material-Icons', href: 'https://material.io/icons/' },
      { text: 'Roboto', href: 'https://material.io/guidelines/resources/roboto-noto-fonts.html' }
    ]} classes={classes} />
    <Divider />
    <InfoTopic title="Main NPM Package:" buttonIcon="extension" buttonList={[
      { text: 'dr-js/dr-js', href: 'https://github.com/dr-js/dr-js' },
      { text: 'mui-org/material-ui', href: 'https://material-ui-next.com' }
    ]} classes={classes} />
    <Divider />
    <Grid component="pre" className={classes.log}>
      {PACKAGE_INFO}
    </Grid>
  </Card></Grid>
</GridContainer>
InfoComponent.propTypes = {
  classes: PropTypes.object.isRequired
}

const InfoTopic = ({ title, buttonIcon, buttonList, classes }) => <CardContent>
  <Typography type="title">
    {title}
  </Typography>
  {buttonList.map(({ text, href }, index) => <Button key={index} className={classes.button} href={href} target="_blank" rel="noopener noreferrer" raised dense>
    <Icon className={classes.buttonIconLeft}>{buttonIcon}</Icon>
    {text}
  </Button>)}
</CardContent>
InfoTopic.propTypes = {
  title: PropTypes.string.isRequired,
  buttonIcon: PropTypes.string.isRequired,
  buttonList: PropTypes.array.isRequired,
  classes: PropTypes.object.isRequired
}

const PACKAGE_INFO = `NPM Package:
  "dr-js"
  "dev-dep-web-react"

  "material-ui"

  "prop-types"
  "react"
  "react-dom"
  "react-redux"

  "firebase"
  "firebase-admin"`

const Info = withStyles((theme) => ({
  log: LogStyle,
  button: MarginXS,
  buttonIconLeft: ButtonIconLeftStyle
}))(InfoComponent)

export { Info }
