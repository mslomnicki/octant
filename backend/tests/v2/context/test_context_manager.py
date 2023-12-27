import pytest

from app import database, db
from app.v2.context.epoch_state import EpochState
from app.v2.context.manager import epoch_context, state_context
from tests.conftest import (
    MOCK_EPOCHS,
    LOCKED_RATIO,
    TOTAL_ED,
    ETH_PROCEEDS,
    ALL_INDIVIDUAL_REWARDS,
    TOTAL_REWARDS,
    MOCKED_PENDING_EPOCH_NO,
    MATCHED_REWARDS,
    MOCKED_FINALIZED_EPOCH_NO,
)


@pytest.fixture(autouse=True)
def before(app, patch_epochs, patch_glm, mock_epoch_details):
    pass


@pytest.mark.parametrize(
    "current, pending, finalized, epoch_num, pending_snapshot, finalized_snapshot, expected",
    [
        (2, 1, 0, 3, False, False, EpochState.FUTURE),
        (2, 1, 0, 2, False, False, EpochState.CURRENT),
        (2, 1, 0, 1, False, False, EpochState.PRE_PENDING),
        (2, 1, 0, 1, True, False, EpochState.PENDING),
        (2, None, 1, 1, True, False, EpochState.FINALIZING),
        (2, None, 1, 1, True, True, EpochState.FINALIZED),
    ],
)
def test_context_from_epoch(
    current,
    pending,
    finalized,
    epoch_num,
    pending_snapshot,
    finalized_snapshot,
    expected,
):
    _setup(current, pending, finalized, pending_snapshot, finalized_snapshot)

    context = epoch_context(epoch_num)

    assert context.epoch_state == expected
    assert context.epoch_details.epoch_num == epoch_num
    assert context.epoch_settings is not None
    assert context.epoch_details is not None
    assert context.octant_rewards is not None


@pytest.mark.parametrize(
    "current, pending, finalized, state, pending_snapshot, finalized_snapshot, expected",
    [
        (2, 1, 0, EpochState.FUTURE, False, False, 3),
        (2, 1, 0, EpochState.CURRENT, False, False, 2),
        (2, 1, 0, EpochState.PRE_PENDING, False, False, 1),
        (2, 1, 0, EpochState.PENDING, True, False, 1),
        (2, None, 1, EpochState.FINALIZING, True, False, 1),
        (2, None, 1, EpochState.FINALIZED, True, True, 1),
    ],
)
def test_context_from_state(
    current, pending, finalized, state, pending_snapshot, finalized_snapshot, expected
):
    _setup(current, pending, finalized, pending_snapshot, finalized_snapshot)

    context = state_context(state)

    assert context.epoch_details.epoch_num == expected
    assert context.epoch_state == state
    assert context.epoch_settings is not None
    assert context.epoch_details is not None
    assert context.octant_rewards is not None


def _setup(current, pending, finalized, pending_snapshot, finalized_snapshot):
    MOCK_EPOCHS.get_current_epoch.return_value = current
    MOCK_EPOCHS.get_pending_epoch.return_value = pending
    MOCK_EPOCHS.get_finalized_epoch.return_value = finalized
    if pending_snapshot:
        database.pending_epoch_snapshot.save_snapshot(
            MOCKED_PENDING_EPOCH_NO,
            ETH_PROCEEDS,
            TOTAL_ED,
            LOCKED_RATIO,
            TOTAL_REWARDS,
            ALL_INDIVIDUAL_REWARDS,
        )
    if finalized_snapshot:
        database.finalized_epoch_snapshot.add_snapshot(
            MOCKED_FINALIZED_EPOCH_NO, MATCHED_REWARDS
        )
    db.session.commit()
