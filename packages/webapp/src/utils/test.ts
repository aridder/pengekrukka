import { ethers } from "ethers";
import { vi } from "vitest";

export const getFakeSigner = (
  overrides: Partial<ethers.Signer> = {}
): ethers.Signer =>
  ({
    getAddress: () => "FIXME_add-random-signer",
    ...overrides,
  } as any as ethers.Signer);

export const getFakeProvider = () =>
  ({
    send: vi.fn(),
    getSigner: vi.fn(() => getFakeSigner()),
  } as any as ethers.providers.Web3Provider);
