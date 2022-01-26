import * as React from 'react';
import Widget from "./Widget";


function App(props) {
  return (
    <div>
      <Widget symbol={props.symbol}/>
    </div>
  );
}

export default App;
