import { useState } from "react";
import { storage } from "declarations/storage";
import HomePage from "./pages/Home"
import { Route, Switch } from "wouter";

function App() {
  // const [greeting, setGreeting] = useState("");

  // function handleSubmit(event: { preventDefault: () => void; target: { elements: { name: { value: any; }; }; }; }) {
  //   event.preventDefault();
  //   const name = event.target.elements.name.value;
  //   storage.greet(name).then((greeting:any) => {
  //     setGreeting(greeting);
  //   });
  //   return false;
  // }

  return (
    <main>
      {/* <img src="/logo2.svg" alt="DFINITY logo" />
      <br />
      <br />
      <form action="#" onSubmit={handleSubmit}>
        <label htmlFor="name">Enter your name: &nbsp;</label>
        <input id="name" alt="Name" type="text" />
        <button type="submit">Click Me!</button>
      </form>
      <section id="greeting">{greeting}</section> */}

      <Switch>
        <Route path="/" component={HomePage} />

        

       
      </Switch>
    </main>
  );
}

export default App;
