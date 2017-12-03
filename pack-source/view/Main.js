import React from 'react'
import { Card, CardContent, Grid, Typography } from 'material-ui'
import { GridContainer } from 'pack-source/view/Layout'

const Main = () => <GridContainer>
  <Grid item xs={12} sm={8} lg={6}><Card><CardContent>
    <Typography paragraph>Welcome !</Typography>
  </CardContent></Card></Grid>
</GridContainer>

export { Main }
