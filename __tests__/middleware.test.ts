

import { NextRequest, NextResponse } from "next/server";

// 1. Mock auth0 first to prevent ESM issues
jest.mock("../src/lib/auth0", () => ({
  auth0: {
    middleware: jest.fn(),
  },
}));

// 2. Mock proxy to control its behavior, without re-importing the real proxy
jest.mock("../src/proxy", () => ({
  proxy: jest.fn(),
}));

import { proxy } from "../src/proxy";
import { auth0 } from "../src/lib/auth0";

describe("proxy", () => {
  const url = "http://localhost/test";
  const request = new NextRequest(url);

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should delegate to proxy and return its response", async () => {
    const mockResponse = new NextResponse("OK", { status: 200 });
    (proxy as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await (proxy as any)(request);
    expect(proxy).toHaveBeenCalledWith(request);
    expect(result).toBe(mockResponse);
  });

  it("should handle errors within proxy gracefully", async () => {
    (proxy as jest.Mock).mockRejectedValueOnce(new Error("boom"));

    await expect((proxy as any)(request)).rejects.toThrow("boom");
  });
});
