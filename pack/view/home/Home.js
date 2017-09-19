import React, { PureComponent } from 'react'
import { Card, CardContent, Grid, Typography } from 'material-ui'
import CSS_METRICS from 'theme/metrics.pcss'

const CSS_CARD = CSS_METRICS[ 'padding-m' ]

class Home extends PureComponent {
  render () {
    return <Grid className={CSS_CARD} container align="center" justify="center">
      <Grid item xs={12} sm={6} lg={3}>
        <Card>
          <CardContent>
            <Typography paragraph>Welcome !</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  }
}

export { Home }
