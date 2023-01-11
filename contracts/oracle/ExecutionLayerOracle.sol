// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IEpochs.sol";

import {OracleErrors} from "../Errors.sol";

/// @title Implementation of execution layer oracle.
/// @notice The goal of the oracle is to provide balance of the Golem Foundation validator execution layer's account
/// which collects fee.
/// Balance for epoch will be taken just after the epoch finished (check `Epochs.sol` contract).
contract ExecutionLayerOracle is Ownable {
    /// @notice Epochs contract address.
    IEpochs public immutable epochs;

    /// @notice validator's address collecting fees
    address public feeAddress;

    /// @notice execution layer account balance in given epoch
    mapping(uint256 => uint256) public balanceByEpoch;

    /// @param epochsAddress Address of Epochs contract.
    constructor(address epochsAddress) {
        epochs = IEpochs(epochsAddress);
    }

    /// @notice set ETH balance in given epoch. Balance has to be in WEI.
    /// Updating epoch other then previous or setting the balance multiple times will be reverted.
    function setBalance(uint256 epoch, uint256 balance) external onlyOwner {
        require(
            epoch > 0 && epoch == epochs.getCurrentEpoch() - 1,
            OracleErrors.CANNOT_SET_BALANCE_FOR_PAST_EPOCHS
        );
        require(balanceByEpoch[epoch] == 0, OracleErrors.BALANCE_ALREADY_SET);
        balanceByEpoch[epoch] = balance;
    }

    /// @notice set execution layer's fee address
    function setFeeAddress(address _feeAddress) external onlyOwner {
        feeAddress = _feeAddress;
    }
}
