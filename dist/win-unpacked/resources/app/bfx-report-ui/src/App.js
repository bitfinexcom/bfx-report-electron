import React from 'react'

import Auth from './components/Auth'
import Header from './components/Header'
import Main from './components/Main'

// refer to /home/gasolin/Documents/bitfinex/webapp/app/views/reports/_index_content.html.erb

function App() {
  return (
    <div>
      <Header />
      <Auth />
      <Main />
    </div>
  )
}

export default App
