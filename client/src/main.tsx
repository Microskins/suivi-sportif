import React from "react";
import ReactDOM from "react-dom/client";
import SiteRouter from "./app/site-router";
import { applySiteIdentity } from "./app/site-identities";
import "./styles.css";

applySiteIdentity(window.location.pathname);

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <SiteRouter />
  </React.StrictMode>,
);
