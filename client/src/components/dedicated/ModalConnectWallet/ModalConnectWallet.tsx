import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import Modal from 'components/core/Modal/Modal';
import ConnectWallet from 'components/dedicated/ConnectWallet/ConnectWallet';

import ModalConnectWalletProps from './types';

const ModalConnectWallet: FC<ModalConnectWalletProps> = ({ modalProps }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.modalConnectWallet',
  });
  const { isConnected } = useAccount();

  return (
    <Modal
      dataTest="ModalConnectWallet"
      header={t('connectVia')}
      isOpen={modalProps.isOpen && !isConnected}
      onClosePanel={modalProps.onClosePanel}
    >
      <ConnectWallet />
    </Modal>
  );
};

export default ModalConnectWallet;
