import cx from 'classnames';
import React, { FC, Fragment } from 'react';
import { useAccount } from 'wagmi';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Svg from 'components/core/Svg/Svg';
import ProposalLoadingStates from 'components/dedicated/ProposalLoadingStates/ProposalLoadingStates';
import useIsDonationAboveThreshold from 'hooks/helpers/useIsDonationAboveThreshold';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useMatchedProposalRewards from 'hooks/queries/useMatchedProposalRewards';
import useProposalRewardsThreshold from 'hooks/queries/useProposalRewardsThreshold';
import useProposalsIpfs from 'hooks/queries/useProposalsIpfs';
import useAllocationsStore from 'store/allocations/store';
import { checkMark, pencil } from 'svg/misc';
import getFormattedEthValue from 'utils/getFormattedEthValue';

import styles from './AllocationItem.module.scss';
import AllocationItemProps from './types';

const AllocationItem: FC<AllocationItemProps> = ({
  address,
  className,
  isAllocatedTo,
  isDisabled,
  isLocked,
  isManuallyEdited,
  onSelectItem,
  value,
}) => {
  const { isConnected } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: proposalRewardsThreshold, isLoading: isLoadingRewardsThreshold } =
    useProposalRewardsThreshold();
  const { data: matchedProposalRewards } = useMatchedProposalRewards();
  const { data: proposalsIpfs, isLoading: isLoadingProposalsIpfs } = useProposalsIpfs([address]);
  const { rewardsForProposals } = useAllocationsStore(state => ({
    rewardsForProposals: state.data.rewardsForProposals,
  }));
  const { name, isLoadingError } = proposalsIpfs[0] || {};

  const isLoading =
    currentEpoch === undefined ||
    (isLoadingRewardsThreshold && currentEpoch > 1) ||
    isLoadingProposalsIpfs;
  const isLoadingStates = isLoadingError || isLoading;

  const percentToRender = rewardsForProposals.isZero()
    ? 0
    : value.mul(100).div(rewardsForProposals).toNumber();
  const valueToRender = getFormattedEthValue(value).fullString;

  const isDonationAboveThreshold = useIsDonationAboveThreshold(address);

  const proposalMatchedProposalRewards = matchedProposalRewards?.find(
    ({ address: matchedProposalRewardsAddress }) => address === matchedProposalRewardsAddress,
  );

  return (
    <BoxRounded
      alignment="center"
      className={cx(styles.root, className)}
      isVertical
      justifyContent="center"
      onClick={isConnected && !isDisabled ? () => onSelectItem(address) : undefined}
    >
      {isLoadingStates ? (
        <ProposalLoadingStates isLoading={isLoading} isLoadingError={isLoadingError} />
      ) : (
        <Fragment>
          <div className={styles.name}>{name}</div>
          {(isAllocatedTo || isManuallyEdited) && (
            <div className={styles.icons}>
              {isAllocatedTo && isLocked && (
                <Svg classNameSvg={styles.icon} img={checkMark} size={2.4} />
              )}
              {isManuallyEdited && !isLocked && (
                <Svg classNameSvg={styles.icon} img={pencil} size={2.4} />
              )}
            </div>
          )}
          <div className={styles.valuesBox}>
            <div className={styles.ethNeeded}>
              {currentEpoch > 1 && (
                <div
                  className={cx(
                    styles.dot,
                    isDonationAboveThreshold && styles.isDonationAboveThreshold,
                  )}
                />
              )}
              {proposalMatchedProposalRewards &&
                proposalRewardsThreshold &&
                `${getFormattedEthValue(proposalMatchedProposalRewards?.sum).value} of ${
                  getFormattedEthValue(proposalRewardsThreshold).fullString
                } needed`}
            </div>
            <div className={styles.allocated}>
              <div className={styles.allocatedPercentage}>{percentToRender}%</div>
              <div className={styles.allocatedAmount}>{valueToRender}</div>
            </div>
          </div>
        </Fragment>
      )}
    </BoxRounded>
  );
};

export default AllocationItem;
