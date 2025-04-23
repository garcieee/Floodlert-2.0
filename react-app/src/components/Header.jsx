import { AppBar, Toolbar, Typography } from '@mui/material'

function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">
          Floodlert
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

export default Header
