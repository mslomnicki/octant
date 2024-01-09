from dataclasses import dataclass
from typing import Tuple, List, Dict

from dataclass_wizard import JSONWizard

from app.context.epoch_details import EpochDetails
from app.engine.epochs_settings import EpochSettings
from app.engine.user.effective_deposit import (
    UserDeposit,
    UserEffectiveDepositPayload,
    DepositEvent,
)


@dataclass(frozen=True)
class AccountFunds(JSONWizard):
    address: str
    amount: int

    def __iter__(self):
        yield self.address
        yield self.amount


def calculate_effective_deposits(
    epoch_details: EpochDetails,
    epoch_settings: EpochSettings,
    events: Dict[str, List[DepositEvent]],
) -> Tuple[List[UserDeposit], int]:
    start = epoch_details.start_sec
    end = epoch_details.end_sec
    effective_deposit_calculator = epoch_settings.user.effective_deposit

    return effective_deposit_calculator.calculate_users_effective_deposits(
        UserEffectiveDepositPayload(
            epoch_start=start, epoch_end=end, lock_events_by_addr=events
        )
    )
