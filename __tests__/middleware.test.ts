// Stub Request for Jest environment
declare global {
  var Request: any;
}
// @ts-ignore - provide a minimal implementation
global.Request = class {};

import { NextRequest, NextResponse } from "next/server";

// Mock the proxy module before importing middleware
const mockProxy = jest.fn();
jest.mock("../src/proxy", () => ({ __esModule: true, proxy: mockProxy }));

import middleware from "../src/middleware";

// No direct import of proxy; use mockProxy in tests
describe("middleware", () => {
  const url = "http://localhost/test";
  const request = new NextRequest(url);

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should delegate to proxy and return its response", async () => {
    const mockResponse = new NextResponse("OK", { status: 200 });
    // @ts-ignore – mockProxy is mocked
    mockProxy.mockResolvedValueOnce(mockResponse);

    const result = await middleware(request);
    expect(mockProxy).toHaveBeenCalledWith(request);
    expect(result).toBe(mockResponse);
  });

  it("should fallback to NextResponse.next() if proxy does not return a NextResponse", async () => {
    // Return a plain object to simulate unexpected return type
    // @ts-ignore
    mockProxy.mockResolvedValueOnce({ foo: "bar" });

    const result = await middleware(request);
    expect(result).toEqual(NextResponse.next());
  });

  it("should catch errors and return 500 response", async () => {
    // @ts-ignore
    mockProxy.mockRejectedValueOnce(new Error("boom"));

    const result = await middleware(request);
    expect(result.status).toBe(500);
    const text = await result.text();
    expect(text).toBe("Internal Server Error");
  });
});
