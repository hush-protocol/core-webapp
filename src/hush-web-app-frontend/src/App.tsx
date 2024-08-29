import { useState } from "react";
import { storage } from "declarations/storage";
import HomePage from "./pages/Home"
import { Route, Switch } from "wouter";
import DashboardPage from "./pages/Dashboard";

function App() {
 

  return (
    <main>
      
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/dashboard" component={DashboardPage} /> 
      </Switch>
    </main>
  );
}

export default App;
