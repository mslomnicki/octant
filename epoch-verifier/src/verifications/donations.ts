import { Context, allocationsByUser, individualDonationsByProposals, rewardsByProject } from "../data/context";
import { Address, Reward } from "../data/models";
import { VerificationResult } from "../runner";
import { assertAll, assertEq } from "./utils";

const PROPOSALS_NO = 24

function getThreshold(individualAllocations: Map<Address, bigint>): bigint {
  const allocationsSum = Array.from(individualAllocations.entries()).reduce((acc, [_, val]) => acc + val, BigInt(0)) 
  const threshold = allocationsSum / (BigInt(PROPOSALS_NO) * BigInt(2))
  return threshold
}

function getUserAllocationsForProjectsAboveThreshold(context: Context): Map<Address, bigint> {
  const individualDonations = individualDonationsByProposals(context)
  const threshold = getThreshold(individualDonations)
  const projectsAboveThreshold = Array.from(individualDonations.entries()).filter(([_, v]) => v > threshold)
  return new Map(projectsAboveThreshold)
}

export function verifyProjectsBelowThreshold(context: Context): VerificationResult {

  const individualDonations = individualDonationsByProposals(context)
  const threshold = getThreshold(individualDonations)

  const projectsBelowThreshold = Array.from(individualDonations.entries()).filter(([_, v]) => v <= threshold).map(([p,_]) => p)
  const rewards = rewardsByProject(context)

  return assertAll(projectsBelowThreshold, (project) => !rewards.has(project))  
}

export function verifyUserDonationsVsRewards(context: Context): VerificationResult {
  const projectsAboveThreshold = Array.from(getUserAllocationsForProjectsAboveThreshold(context).entries())
  const rewards = rewardsByProject(context)
  
  return assertAll(projectsAboveThreshold, ([proposal, allocated]) =>  assertEq(allocated, rewards.get(proposal)!.allocated, BigInt(100), true))
}

export function verifyRewardsVsUserDonations(context: Context): VerificationResult {
  const projectsAboveThreshold = getUserAllocationsForProjectsAboveThreshold(context)
  const rewards = Array.from(rewardsByProject(context).entries())
  
  return assertAll(rewards, ([proposal, reward]: [Address, Reward]) =>  assertEq(reward.allocated, projectsAboveThreshold.get(proposal)!, BigInt(100), true))
  
}

export function verifyMatchedFunds(context: Context): VerificationResult {
  const projectsAboveThreshold = Array.from(getUserAllocationsForProjectsAboveThreshold(context).entries())
  const rewards = rewardsByProject(context)

  const totalAllocations = projectsAboveThreshold.reduce((acc, [_, v]) => acc + v, BigInt(0))
  const matchingFund = context.epochInfo.matchedRewards

  return assertAll(projectsAboveThreshold, ([proposal, allocated]) => {
    const matched = matchingFund * allocated / totalAllocations
    return assertEq(matched, rewards.get(proposal)!.matched, BigInt(100), true)
  })
  
}

export function verifyMatchingFundFromEpochInfo(context: Context): VerificationResult {
  const verifyMatchedRewards = [context.epochInfo.totalRewards - context.epochInfo.individualRewards + context.epochInfo.patronsRewards, context.epochInfo.matchedRewards]

  return assertAll([verifyMatchedRewards], ([value, expected]) => assertEq(value, expected))
}

export function verifyTotalWithdrawals(context: Context): VerificationResult {
  const budgets = Array.from(context.budgets.values()).reduce((acc, budget) => acc + budget, BigInt(0)) 

  const allocs = allocationsByUser(context)
  const totalAllocated = Array.from(allocs.values())
    .flatMap((donations) => donations.map(donation => donation.amount))
    .reduce((acc, val) => acc + val, BigInt(0))

  const unclaimedAndPatronsBudget = Array.from(context.budgets.entries()).filter(([user,_]) => !allocs.has(user)).reduce((acc, [_, budget]) => acc + budget, BigInt(0))
  const unclaimed = unclaimedAndPatronsBudget - context.epochInfo.patronsRewards

  const claimed = budgets - totalAllocated - unclaimed - context.epochInfo.patronsRewards
  const rewards = context.rewards.reduce((acc, reward) => acc + reward.allocated + reward.matched, BigInt(0)) 

  return assertEq(claimed + rewards, context.epochInfo.totalWithdrawals)
}
