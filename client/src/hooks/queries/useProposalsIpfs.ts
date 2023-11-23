import { useQueries, UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { apiGetProposal } from 'api/calls/proposals';
import { QUERY_KEYS } from 'api/queryKeys';
import { ExtendedProposal } from 'types/extended-proposal';
import { BackendProposal } from 'types/gen/backendproposal';
import triggerToast from 'utils/triggerToast';

import useProposalsCid from './useProposalsCid';
import useProposalsContract from './useProposalsContract';

export default function useProposalsIpfs(proposalsAddresses?: string[]): {
  data: ExtendedProposal[];
  isFetching: boolean;
  refetch: () => void;
} {
  const { t } = useTranslation('translation', { keyPrefix: 'api.errorMessage' });
  const { data: proposalsCid, isFetching: isFetchingProposalsCid } = useProposalsCid();
  const { refetch } = useProposalsContract();

  const proposalsIpfsResults: UseQueryResult<BackendProposal>[] = useQueries({
    queries: (proposalsAddresses || []).map(address => ({
      enabled: !!address && !!proposalsCid,
      queryFn: () => apiGetProposal(`${proposalsCid}/${address}`),
      queryKey: QUERY_KEYS.proposalsIpfsResults(address),
      retry: false,
    })),
  });

  const isAnyError = proposalsIpfsResults.some(element => element.isError);
  useEffect(() => {
    if (!isAnyError) {
      return;
    }
    triggerToast({
      message: t('ipfs.message'),
      type: 'error',
    });
  }, [isAnyError, t]);

  const isProposalsIpfsResultsFetching =
    isFetchingProposalsCid ||
    proposalsIpfsResults.length === 0 ||
    proposalsIpfsResults.some(({ isFetching }) => isFetching);

  if (isProposalsIpfsResultsFetching) {
    return {
      data: [],
      isFetching: isProposalsIpfsResultsFetching,
      refetch,
    };
  }

  const proposalsIpfsResultsWithAddresses = proposalsIpfsResults.map<ExtendedProposal>(
    (proposal, index) => ({
      address: proposalsAddresses![index],
      isLoadingError: proposal.isError,
      ...(proposal.data || {}),
    }),
  );

  return {
    data: proposalsIpfsResultsWithAddresses,
    isFetching: false,
    refetch,
  };
}
