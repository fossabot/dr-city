import React, { PureComponent } from 'react'
import { Card, CardContent, Grid, Typography } from 'material-ui'
import { GridContainer } from 'view/__utils__'

class Home extends PureComponent {
  render () {
    return <GridContainer>
      <Grid item xs={12} sm={8} lg={6}>
        <Card>
          <CardContent>
            <Typography paragraph>Welcome !</Typography>
          </CardContent>
        </Card>
      </Grid>
    </GridContainer>
  }
}

export { Home }
