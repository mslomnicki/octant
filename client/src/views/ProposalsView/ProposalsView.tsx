import React, { FC } from 'react';

import MainLayoutContainer from 'layouts/MainLayout/MainLayoutContainer';
import ProposalItem from 'components/dedicated/ProposalItem/ProposalItem';
import useCurrentEpoch from 'hooks/useCurrentEpoch';
import useIdsInAllocation from 'hooks/useIdsInAllocation';
import useMatchedProposalRewards from 'hooks/useMatchedProposalRewards';
import useProposals from 'hooks/useProposals';

import ProposalsViewProps from './types';
import styles from './style.module.scss';

const ProposalsView: FC<ProposalsViewProps> = ({ allocations }) => {
  const { proposals } = useProposals();
  const { data: currentEpoch } = useCurrentEpoch();
  const { onAddRemoveFromAllocate } = useIdsInAllocation({ allocations, proposals });
  const { data: matchedProposalRewards } = useMatchedProposalRewards();

  const shouldMatchedProposalRewardsBeAvailable =
    !!currentEpoch && ((currentEpoch > 1 && matchedProposalRewards) || currentEpoch === 1);

  return (
    <MainLayoutContainer
      isLoading={proposals.length === 0 || !shouldMatchedProposalRewardsBeAvailable}
    >
      <div className={styles.list}>
        {proposals &&
          shouldMatchedProposalRewardsBeAvailable &&
          proposals.map((proposal, index) => {
            const proposalMatchedProposalRewards = matchedProposalRewards?.find(
              ({ id }) => id === proposal.id.toNumber(),
            );
            return (
              <ProposalItem
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                isAlreadyAdded={allocations.includes(proposal.id.toNumber())}
                onAddRemoveFromAllocate={() => onAddRemoveFromAllocate(proposal.id.toNumber())}
                percentage={proposalMatchedProposalRewards?.percentage}
                totalValueOfAllocations={proposalMatchedProposalRewards?.sum}
                {...proposal}
              />
            );
          })}
      </div>
    </MainLayoutContainer>
  );
};

export default ProposalsView;
