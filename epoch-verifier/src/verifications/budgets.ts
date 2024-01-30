import { Context } from "../data/context";
import { VerificationResult } from "../runner";
import { assertAll, assertEq } from "./utils";

export function compareUserBudgetsVsTheirAllocations(context: Context): VerificationResult {

  const sums = context.allocations.map((user_alloc) => 
    [
      user_alloc.user,
      user_alloc.donations.reduce((acc, donation) => acc + donation.amount, BigInt(0))
    ] as const
  )

  return assertAll(sums, ([user, sum]) => 
    sum <= (context.budgets.get(user) ?? BigInt(0))
  )
  
}

export function budgetsAreEqualToIndividualRewards(context: Context): VerificationResult {
  const budgets = Array.from(context.budgets.entries()).reduce((acc, [_user, budget]) => acc + budget, BigInt(0)) 

  return assertEq(budgets, context.epochInfo.individualRewards, BigInt(500), true)
}
