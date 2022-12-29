// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./interfaces/IDeposits.sol";
import "./interfaces/IHexagonOracle.sol";
import "./interfaces/IEpochs.sol";
import "./interfaces/IAllocationsStorage.sol";

/// tightly coupled contracts
import "./Tracker.sol";

/// external dependencies
import "@prb/math/contracts/PRBMathUD60x18.sol";
import "./interfaces/IProposals.sol";

contract Rewards {
    using PRBMathUD60x18 for uint256;

    struct ProposalRewards {
        uint256 id;
        uint256 donated;
        uint256 matched;
    }

    /// @notice In order to be eligible for receiving donations in the epoch,
    /// a proposal must pass a predefined threshold of individual donation.
    /// This threshold is expressed as a percentage.
    uint256 public constant PROPOSAL_DONATION_THRESHOLD_PERCENT = 10;

    /// @notice Epochs contract.
    IEpochs public immutable epochs;

    /// @notice GLM deposits contract.
    IDeposits public immutable deposits;

    /// @notice Effective deposit tracking.
    Tracker public immutable tracker;

    /// @notice ETH staking proceeds oracle.
    IHexagonOracle public immutable oracle;

    /// @notice Actual proposals store.
    IProposals public immutable proposals;

    /// @notice Tracking user`s allocations.
    IAllocationsStorage public immutable allocationsStorage;

    constructor(
        address epochsAddress,
        address depositsAddress,
        address trackerAddress,
        address oracleAddress,
        address proposalsAddress,
        address allocationsStorageAddress
    ) {
        epochs = IEpochs(epochsAddress);
        deposits = IDeposits(depositsAddress);
        tracker = Tracker(trackerAddress);
        oracle = IHexagonOracle(oracleAddress);
        proposals = IProposals(proposalsAddress);
        allocationsStorage = IAllocationsStorage(allocationsStorageAddress);
    }

    /// @notice Compute funds staked at a particular epoch as ratio to total GLM token supply.
    function stakedRatio(uint256 epoch) public view returns (uint256) {
        uint256 tokenSupply = tracker.tokenSupplyAt(epoch);
        return tracker.totalDepositAt(epoch).div(tokenSupply);
    }

    /// @notice Compute total individual rewards for particular epoch.
    function allIndividualRewards(uint256 epoch) public view returns (uint256) {
        return oracle.getTotalETHStakingProceeds(epoch).mul(stakedRatio(epoch));
    }

    /// @notice Compute user's individual reward for particular epoch.
    function individualReward(uint256 epoch, address individual) public view returns (uint256) {
        uint256 myDeposit = tracker.depositAt(individual, epoch);
        if (myDeposit == 0) {
            return 0;
        }
        uint256 allRewards = allIndividualRewards(epoch);
        uint256 individualShare = myDeposit.div(tracker.totalDepositAt(epoch));
        return allRewards.mul(individualShare);
    }

    /// @notice Compute total rewards to be distributed between users and proposals.
    function totalRewards(uint256 epoch) public view returns (uint256) {
        uint256 ratio = stakedRatio(epoch);
        return oracle.getTotalETHStakingProceeds(epoch).mul(ratio.sqrt());
    }

    /// @notice Compute matched rewards.
    function matchedRewards(uint256 epoch) public view returns (uint256) {
        return totalRewards(epoch) - allIndividualRewards(epoch);
    }

    /// @notice Total donated funds by participants.
    function individualProposalRewards(uint256 epoch)
        public
        view
        returns (uint256, ProposalRewards[] memory)
    {
        uint256[] memory proposalIds = proposals.getProposalIds(epoch);
        uint256 proposalRewardsSum;
        ProposalRewards[] memory proposalRewards = new ProposalRewards[](proposalIds.length);
        for (uint256 iProposal = 0; iProposal < proposalIds.length; iProposal++) {
            proposalRewards[iProposal].id = proposalIds[iProposal];
            (address[] memory users, uint256[] memory alphas) = allocationsStorage.getUsersAlphas(
                epoch,
                proposalIds[iProposal]
            );

            // count individual rewards for proposals.
            for (uint256 iUser = 0; iUser < users.length; iUser++) {
                uint256 userReward = individualReward(epoch, users[iUser]);
                uint256 rewardAfterAlpha = userReward.div(100).mul(alphas[iUser]);
                proposalRewards[iProposal].donated =
                    proposalRewards[iProposal].donated +
                    rewardAfterAlpha;
                proposalRewardsSum = proposalRewardsSum + rewardAfterAlpha;
            }
        }
        return (proposalRewardsSum, proposalRewards);
    }

    /// @notice Compute proposal rewards.
    function matchedProposalRewards(uint256 epoch)
        external
        view
        returns (ProposalRewards[] memory)
    {
        (
            uint256 proposalRewardsSum,
            ProposalRewards[] memory proposalRewards
        ) = individualProposalRewards(epoch);

        uint256 _matchedRewards = matchedRewards(epoch);
        uint256 proposalDonationThreshold = proposalRewardsSum.div(100).mul(
            PROPOSAL_DONATION_THRESHOLD_PERCENT
        );

        // calculate proposal donation above threshold.
        uint256 proposalDonationAboveThresholdSum;
        for (uint256 iReward = 0; iReward < proposalRewards.length; iReward++) {
            if (proposalRewards[iReward].donated > proposalDonationThreshold) {
                proposalDonationAboveThresholdSum += proposalRewards[iReward].donated;
            }
        }

        // distribute matched rewards.
        for (uint256 iReward = 0; iReward < proposalRewards.length; iReward++) {
            if (proposalRewards[iReward].donated > proposalDonationThreshold) {
                uint256 proposalRewardsPercent = proposalRewards[iReward]
                    .donated
                    .div(proposalDonationAboveThresholdSum)
                    .mul(100);
                uint256 matchedProposalReward = _matchedRewards.div(100).mul(
                    proposalRewardsPercent
                );
                proposalRewards[iReward].matched = matchedProposalReward;
            }
        }
        return proposalRewards;
    }
}
