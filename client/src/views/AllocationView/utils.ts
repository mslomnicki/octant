import { BigNumber } from 'ethers';

import { AllocationItemWithAllocations } from 'components/dedicated/AllocationItem/types';
import { ProposalIpfsWithRewards } from 'hooks/queries/useProposalsIpfsWithRewards';
import { UserAllocationElement } from 'hooks/queries/useUserAllocations';
import getSortedElementsByTotalValueOfAllocationsAndAlphabetical from 'utils/getSortedElementsByTotalValueOfAllocationsAndAlphabetical';

import { AllocationValues } from './types';

export function getAllocationValuesWithRewardsSplitted({
  allocationValues,
  restToDistribute,
}: {
  allocationValues: AllocationValues;
  restToDistribute: BigNumber;
}): AllocationValues {
  if (allocationValues.length === 0) {
    return [];
  }
  const allocationValuesNew = [...allocationValues];
  const allocationValuesSum = allocationValuesNew.reduce(
    (acc, { value }) => acc.add(value),
    BigNumber.from(0),
  );

  if (allocationValuesSum.lt(restToDistribute)) {
    allocationValuesNew[allocationValuesNew.length - 1].value = allocationValuesNew[
      allocationValuesNew.length - 1
    ].value.add(restToDistribute.sub(allocationValuesSum));
  }

  return allocationValuesNew;
}

export function getAllocationValuesInitialState({
  allocations,
  rewardsForProposals,
  userAllocationsElements,
  isLocked,
}: {
  allocations: string[];
  isLocked: boolean;
  rewardsForProposals: BigNumber;
  userAllocationsElements: UserAllocationElement[] | undefined;
}): AllocationValues {
  const allocationValues = !isLocked
    ? allocations.map(allocation => ({
        address: allocation,
        value: rewardsForProposals.div(allocations.length),
      }))
    : allocations.map(allocation => {
        const userAllocationsElement = userAllocationsElements?.find(
          ({ address }) => address === allocation,
        );
        return {
          address: allocation,
          value: userAllocationsElement ? userAllocationsElement.value : BigNumber.from(0),
        };
      });

  return getAllocationValuesWithRewardsSplitted({
    allocationValues,
    restToDistribute: rewardsForProposals,
  });
}

export function getAllocationsWithRewards({
  proposalsIpfsWithRewards,
  allocationValues,
  areAllocationsAvailableOrAlreadyDone,
  userAllocationsElements,
}: {
  allocationValues: AllocationValues | undefined;
  areAllocationsAvailableOrAlreadyDone: boolean;
  proposalsIpfsWithRewards: ProposalIpfsWithRewards[];
  userAllocationsElements: UserAllocationElement[] | undefined;
}): AllocationItemWithAllocations[] {
  const isDataDefined =
    proposalsIpfsWithRewards &&
    proposalsIpfsWithRewards.length > 0 &&
    areAllocationsAvailableOrAlreadyDone;
  let allocationsWithRewards = isDataDefined
    ? allocationValues!.map(allocationValue => {
        const proposal = proposalsIpfsWithRewards.find(
          ({ address }) => address === allocationValue.address,
        )!;
        const isAllocatedTo = !!userAllocationsElements?.find(
          ({ address }) => address === allocationValue.address,
        );

        return {
          isAllocatedTo,
          ...allocationValue,
          ...proposal,
        };
      })
    : [];

  // TODO OCT-804 check sorting algorithm.
  allocationsWithRewards.sort(({ value: valueA }, { value: valueB }) => {
    if (valueA.lt(valueB)) {
      return 1;
    }
    if (valueA.gt(valueB)) {
      return -1;
    }
    return 0;
  });

  allocationsWithRewards = getSortedElementsByTotalValueOfAllocationsAndAlphabetical(
    allocationsWithRewards as AllocationItemWithAllocations[],
  ) as AllocationItemWithAllocations[];

  return allocationsWithRewards;
}

export function getRestToDistribute({
  individualReward,
  rewardsForProposals,
  allocationValues,
  allocationsEdited,
}: {
  allocationValues: AllocationValues;
  allocationsEdited: string[];
  individualReward: BigNumber | undefined;
  rewardsForProposals: BigNumber;
}): BigNumber {
  if (!individualReward) {
    return BigNumber.from(0);
  }

  const allocationValuesArrayEditedNew = allocationValues.filter(({ address }) =>
    allocationsEdited.includes(address),
  );

  const allocationValuesArrayEditedValueSum = allocationValuesArrayEditedNew.reduce(
    (acc, { value }) => acc.add(value),
    BigNumber.from(0),
  );

  return rewardsForProposals.sub(allocationValuesArrayEditedValueSum);
}

export function getNewAllocationValues({
  allocationValues,
  allocationsEdited,
  proposalAddressToModify,
  newValue,
  rewardsForProposals,
  individualReward,
}: {
  allocationValues: AllocationValues;
  allocationsEdited: string[];
  individualReward: BigNumber | undefined;
  newValue: BigNumber;
  proposalAddressToModify: string;
  rewardsForProposals: BigNumber;
}): AllocationValues {
  if (!individualReward) {
    return allocationValues;
  }

  const allocationValuesArrayNew = allocationValues.map(element => ({
    ...element,
    value: element.address === proposalAddressToModify ? newValue : element.value,
  }));

  const allocationValuesArrayNotEdited = allocationValuesArrayNew.filter(
    ({ address }) => !allocationsEdited.includes(address),
  );
  const allocationValuesArrayEditedNew = allocationValuesArrayNew.filter(({ address }) =>
    allocationsEdited.includes(address),
  );

  const restToDistribute = getRestToDistribute({
    allocationValues: allocationValuesArrayNew,
    allocationsEdited,
    individualReward,
    rewardsForProposals,
  });

  const allocationValuesArrayNotEditedNew = allocationValuesArrayNotEdited.map(element => ({
    ...element,
    value: restToDistribute.div(allocationValuesArrayNotEdited.length),
  }));

  return [
    ...getAllocationValuesWithRewardsSplitted({
      allocationValues: allocationValuesArrayNotEditedNew,
      restToDistribute,
    }),
    ...allocationValuesArrayEditedNew,
  ];
}
