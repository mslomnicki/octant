// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

library AllocationErrors {
    /// @notice Thrown when the user trying to allocate for proposal with id equals 0
    /// @return HN:Allocations/proposal-id-equals-0
    string public constant PROPOSAL_ID_CANNOT_BE_ZERO = "HN:Allocations/proposal-id-equals-0";

    /// @notice Thrown when the user trying to allocate before first epoch has started
    /// @return HN:Allocations/not-started-yet
    string public constant EPOCHS_HAS_NOT_STARTED_YET = "HN:Allocations/first-epoch-not-started-yet";

    /// @notice Thrown when the user trying to allocate after decision window is closed
    /// @return HN:Allocations/decision-window-closed
    string public constant DECISION_WINDOW_IS_CLOSED = "HN:Allocations/decision-window-closed";

    /// @notice Thrown when user trying to allocate more than he has in rewards budget for given epoch.
    /// @return HN:Allocations/allocate-above-rewards-budget
    string public constant ALLOCATE_ABOVE_REWARDS_BUDGET = "HN:Allocations/allocate-above-rewards-budget";
}

library AllocationStorageErrors {
    /// @notice Thrown when trying to allocate without removing it first. Should never occur as this
    /// is called from Allocations contract
    /// @return HN:AllocationsStorage/allocation-already-exists
    string public constant ALLOCATION_ALREADY_EXISTS = "HN:AllocationsStorage/allocation-already-exists";

    /// @notice Thrown when trying to allocate which does not exist. Should never occur as this
    /// is called from Allocations contract.
    /// @return HN:AllocationsStorage/allocation-does-not-exist
    string public constant ALLOCATION_DOES_NOT_EXIST = "HN:AllocationsStorage/allocation-does-not-exist";
}

library OracleErrors {
    /// @notice Thrown when trying to set the balance in oracle for epochs other then previous.
    /// @return HN:Oracle/can-set-balance-for-previous-epoch-only
    string public constant CANNOT_SET_BALANCE_FOR_PAST_EPOCHS =
    "HN:Oracle/can-set-balance-for-previous-epoch-only";

    /// @notice Thrown when trying to set the oracle balance multiple times.
    /// @return HN:Oracle/balance-for-given-epoch-already-exists
    string public constant BALANCE_ALREADY_SET = "HN:Oracle/balance-for-given-epoch-already-exists";
}

library DepositsErrors {
    /// @notice Thrown when transfer operation fails in GLM smart contract.
    /// @return HN:Deposits/cannot-transfer-from-sender
    string public constant GLM_TRANSFER_FAILED = "HN:Deposits/cannot-transfer-from-sender";

    /// @notice Thrown when trying to withdraw more GLMs than are in deposit.
    /// @return HN:Deposits/deposit-is-smaller
    string public constant DEPOSIT_IS_TO_SMALL = "HN:Deposits/deposit-is-smaller";
}

library EpochsErrors {
    /// @notice Thrown when calling the contract before the first epoch started.
    /// @return HN:Epochs/not-started-yet
    string public constant NOT_STARTED = "HN:Epochs/not-started-yet";
}

library TrackerErrors {
    /// @notice Thrown when trying to get info about effective deposits in future epochs.
    /// @return HN:Tracker/future-is-unknown
    string public constant FUTURE_IS_UNKNOWN = "HN:Tracker/future-is-unknown";

    /// @notice Thrown when trying to get info about effective deposits in epoch 0.
    /// @return HN:Tracker/epochs-start-from-1
    string public constant EPOCHS_START_FROM_1 = "HN:Tracker/epochs-start-from-1";

    /// @notice Thrown when trying updat effective deposits as an unauthorized account.
    /// @return HN:Tracker/invalid-caller
    string public constant UNAUTHORIZED_CALLER = "HN:Tracker/unauthorized-caller";
}
