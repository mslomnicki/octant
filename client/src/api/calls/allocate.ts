import env from 'env';
import apiService from 'services/apiService';

export type ApiPostAllocateSimulateData = {
  allocations: {
    // WEI
    amount: string;
    proposalAddress: string;
  }[];
};

export type ApiPostAllocateData = {
  payload: ApiPostAllocateSimulateData;
  signature: string;
};

export function apiPostAllocate(allocateData: ApiPostAllocateData): Promise<any> {
  return apiService
    .post(`${env.serverEndpoint}allocations/allocate`, allocateData)
    .then(({ data }) => data);
}

export function apiPostAllocateSimulate(
  allocateData: ApiPostAllocateSimulateData,
  userAddress: string,
): Promise<any> {
  return apiService
    .post(`${env.serverEndpoint}allocations/simulate/${userAddress}`, allocateData)
    .then(({ data }) => data);
}
