import React from 'react';
import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/Signup';
import Welcome from './components/welcome';
import ForgotPassword from './components/forgotpassword';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" render={() => <Redirect to="/welcome" />} />
        <Route path="/signup" component={SignUp} />
        <Route path="/signin" component={Login} />
        <Route path="/forgotpassword" component={ForgotPassword} />
        <Route path="/welcome" component={Welcome} />
        <Route render={() => <Redirect to="/welcome" />} />
      </Switch>
    </Router>
  );
}

export default App;
