import { Inspector } from 'react-dev-inspector'
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from "./App";
import CustomPostHogProvider from "./hooks/CustomPostHogProvider";
import "./index.css";
import { persistor, store } from "./redux/store";
import "./shortcuts-bar.css";

const queryClient = new QueryClient();

(async () => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      {process.env.NODE_ENV === 'development' ? <Inspector /> : null}
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <PersistGate loading={null} persistor={persistor}>
            <CustomPostHogProvider>
              <App />
            </CustomPostHogProvider>
          </PersistGate>
        </QueryClientProvider>
      </Provider>
    </React.StrictMode>,
  );
})();
