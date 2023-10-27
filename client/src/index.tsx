// eslint-disable-next-line import/no-extraneous-dependencies
import 'regenerator-runtime/runtime';
import './wallect-connect-polyfill';
import { QueryClientProvider } from '@tanstack/react-query';
import { Web3Modal } from '@web3modal/react';
import React, { Fragment } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { WagmiConfig } from 'wagmi';

import env, { envViteKeys, envsAllowedToBeEmpty } from 'env';

import { ethereumClient } from './api/clients/client-ethereum';
import clientReactQuery from './api/clients/client-react-query';
import { wagmiConfig } from './api/clients/client-wagmi';
import App from './App/App';
import { PROJECT_ID } from './constants/walletConnect';

const root = document.getElementById('root')!;

(() => {
  const emptyEnvs = Object.entries(env).reduce(
    (acc, [key, value]) => (!value ? { ...acc, [envViteKeys[key]]: value } : acc),
    {},
  );
  const emptyEnvKeys = Object.keys(emptyEnvs);

  if (
    emptyEnvKeys.length > 0 &&
    emptyEnvKeys.some(element => !envsAllowedToBeEmpty.includes(element))
  ) {
    const errorMessage =
      'The application crashed because values for the following envs are missing';
    const emptyEnvKeysWithLinebreaksConsole = emptyEnvKeys.map(element => `\n-- ${element}`);
    const emptyEnvKeysWithLinebreaksUI = emptyEnvKeys.map(element => `<br />-- ${element}`);

    ReactDOM.createRoot(root).render(
      <div
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          // eslint-disable-next-line @typescript-eslint/naming-convention
          __html: `${errorMessage}: ${emptyEnvKeysWithLinebreaksUI}`,
        }}
      />,
    );
    throw new Error(`${errorMessage}: ${emptyEnvKeysWithLinebreaksConsole}`);
  }

  ReactDOM.createRoot(root).render(
    <Fragment>
      <WagmiConfig config={wagmiConfig}>
        <QueryClientProvider client={clientReactQuery}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
          <ToastContainer
            position="top-center"
            style={{ overflowWrap: 'break-word', width: '350px' }}
            theme="dark"
          />
        </QueryClientProvider>
      </WagmiConfig>
      <Web3Modal ethereumClient={ethereumClient} projectId={PROJECT_ID} />
    </Fragment>,
  );
})();
