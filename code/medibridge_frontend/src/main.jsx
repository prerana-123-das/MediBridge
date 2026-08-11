import React from 'react'
import ReactDOM from 'react-dom/client'
<<<<<<< HEAD
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './app/store'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
=======
import App from './App'
import './index.css'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './app/store'
import 'bootstrap/dist/css/bootstrap.min.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
)
>>>>>>> 98b0a17ccee8f36872150f34202bb462998a66d6
