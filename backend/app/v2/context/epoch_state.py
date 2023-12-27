from enum import StrEnum

from app import database
from app.exceptions import InvalidEpoch
from app.extensions import epochs


class EpochState(StrEnum):
    FINALIZED = "finalized"
    FINALIZING = "finalizing"
    PENDING = "pending"
    PRE_PENDING = "pre_pending"
    CURRENT = "current"
    FUTURE = "future"


def get_epoch_state(epoch_num: int) -> EpochState:
    validate_epoch_num(epoch_num)
    current_epoch_num = epochs.get_current_epoch()
    pending_epoch = epochs.get_pending_epoch()
    pending_snapshot = database.pending_epoch_snapshot.get_by_epoch(epoch_num)
    finalized_snapshot = database.finalized_epoch_snapshot.get_by_epoch(epoch_num)

    if epoch_num > current_epoch_num:
        return EpochState.FUTURE
    if epoch_num == current_epoch_num:
        return EpochState.CURRENT
    if epoch_num == pending_epoch:
        if pending_snapshot is None:
            return EpochState.PRE_PENDING
        else:
            return EpochState.PENDING
    if pending_snapshot is None:
        raise InvalidEpoch()
    if finalized_snapshot is None:
        return EpochState.FINALIZING
    else:
        return EpochState.FINALIZED


def get_epoch_number(epoch_state: EpochState) -> int:
    epoch_num = None
    if epoch_state == EpochState.FUTURE:
        epoch_num = epochs.get_current_epoch() + 1
    if epoch_state == EpochState.CURRENT:
        epoch_num = epochs.get_current_epoch()
    if epoch_state == EpochState.PRE_PENDING or epoch_state == EpochState.PENDING:
        epoch_num = epochs.get_pending_epoch()
    if epoch_state == EpochState.FINALIZING or epoch_state == EpochState.FINALIZED:
        epoch_num = epochs.get_finalized_epoch()
    validate_epoch_num(epoch_num)
    validate_epoch_state(epoch_num, epoch_state)

    return epoch_num


def validate_epoch_num(epoch_num: int):
    if epoch_num is None or epoch_num is 0:
        raise InvalidEpoch()


def validate_epoch_state(epoch_num: int, epoch_state: EpochState):
    pending_snapshot = database.pending_epoch_snapshot.get_by_epoch(epoch_num)
    finalized_snapshot = database.finalized_epoch_snapshot.get_by_epoch(epoch_num)

    if epoch_state == EpochState.PRE_PENDING:
        if pending_snapshot is not None:
            raise InvalidEpoch()

    if epoch_state == EpochState.PENDING:
        if pending_snapshot is None:
            raise InvalidEpoch()

    if epoch_state == EpochState.FINALIZING:
        if pending_snapshot is None or finalized_snapshot is not None:
            raise InvalidEpoch()

    if epoch_state == EpochState.FINALIZED:
        if pending_snapshot is None or finalized_snapshot is None:
            raise InvalidEpoch()
