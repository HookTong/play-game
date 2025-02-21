import { Outlet } from "react-router";
import "./App.css";
import logo from "./assets/react.svg";
export default function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>

      <div className="App-body">
        <Outlet />
      </div>
    </div>
  );
}
