import {
  createStore,
  applyMiddleware,
  compose,
} from 'redux'
import createSagaMiddleware from 'redux-saga'
import { createLogger } from 'redux-logger'
import reducer from './reducers'
import saga from './sagas'

const sagaMiddleware = createSagaMiddleware();

function configureStore() {
  // eslint-disable-next-line no-underscore-dangle
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  // add middlewares here
  const middleware = [sagaMiddleware];
  // use the logger in development mode - this is set in webpack.config.dev.js
  if (process.env.NODE_ENV !== 'production') {
    middleware.push(createLogger());
  }

  return createStore(
    reducer,
    composeEnhancers(applyMiddleware(...middleware)),
  )
}

const store = configureStore();
sagaMiddleware.run(saga);

export {
  configureStore,
  store,
}
