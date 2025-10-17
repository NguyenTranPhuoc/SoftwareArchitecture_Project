import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Chat from './components/Chat';
import Contacts from './components/Contacts';
import Profile from './components/Profile';
import Auth from './components/Auth';

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/chat" component={Chat} />
        <Route path="/contacts" component={Contacts} />
        <Route path="/profile" component={Profile} />
        <Route path="/auth" component={Auth} />
        <Route path="/" exact>
          <h1>Welcome to Zalo Clone</h1>
        </Route>
      </Switch>
    </Router>
  );
};

export default App;