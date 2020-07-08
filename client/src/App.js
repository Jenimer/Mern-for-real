import React, { Fragment, useEffect }from 'react';
import { Provider } from 'react-redux';
import store from './store'
import './App.css';
import { loadUser } from './actions/auth'
import  setHeaders from './utils/setHeaders'
import { Route, Switch } from 'react-router-dom';
import ProtectedRoute from './components/routing/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Alert from './components/layout/Alert';
import Dashboard from './components/dashboard/Dashboard';
import ProfileForm from './components/profile-form/ProfileForm';

if(localStorage.token) {
  setHeaders(localStorage.token)
}

const App = () => { 
  useEffect(() => {
    store.dispatch(loadUser())
  }, [])
  return (

<Provider store={store}>
  <Fragment>
    <Navbar />
      <Route exact path='/' component={ Landing } />
    <section className='container'>
    <Alert />
    <Switch>
      <Route exact path='/login' component={ Login } />
      <Route exact path='/register' component={Register} />
      <ProtectedRoute exact path='/dashboard' component={Dashboard} />
      <ProtectedRoute exact path='/profileForm' component={ProfileForm} />
    </Switch>
    </section>
  </Fragment>
  </Provider>
)}
export default App;
