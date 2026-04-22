import "./App.scss";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import appRoutes from "./routes/routes";
// import { useNavigate } from "react-router-dom";
import Loading from "./components/Loading/Loading";
import Onboarding from "./components/Onboarding/Onboarding";
import Info from './components/Info/Info'
import Final from "./components/Final/Final";
import Test from "./components/Test/Test";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function AppRoutes() {
      const navigate = useNavigate();


    useEffect(() => {
    // window.Telegram.WebApp.ready();
    navigate(appRoutes.LOADDING, { replace: true });
  }, []);

  return (
    <div className="App">


      <Routes>
        <Route path={appRoutes.LOADDING} element={<Loading/>}/>
        <Route path={appRoutes.ONBOARDING} element={<Onboarding/>}/>
        <Route path={appRoutes.INFO} element={<Info/>}/>
        <Route path={appRoutes.TEST} element={<Test/>}/>
        <Route path={appRoutes.FINAL} element={<Final/>}/>
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
