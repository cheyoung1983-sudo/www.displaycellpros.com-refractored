import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { HardwareScanChart } from "./HardwareScanChart";

// Mock recharts to avoid JSDOM charting rendering exceptions
vi.mock("recharts", () => {
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="mock-responsive-container">{children}</div>
    ),
    AreaChart: ({ children, data }: { children: React.ReactNode; data: any }) => (
      <div data-testid="mock-area-chart" data-data={JSON.stringify(data)}>
        {children}
      </div>
    ),
    Area: () => <div data-testid="mock-area" />,
    LineChart: ({ children, data }: { children: React.ReactNode; data: any }) => (
      <div data-testid="mock-line-chart" data-data={JSON.stringify(data)}>
        {children}
      </div>
    ),
    Line: () => <div data-testid="mock-line" />,
    XAxis: () => <div data-testid="mock-xaxis" />,
    YAxis: () => <div data-testid="mock-yaxis" />,
    CartesianGrid: () => <div data-testid="mock-cartesiangrid" />,
    Tooltip: () => <div data-testid="mock-tooltip" />,
    Legend: () => <div data-testid="mock-legend" />,
  };
});

describe("HardwareScanChart Component Diagnostic Telemetry Tests", () => {
  it("renders correctly with non-battery issues (displays EXCELLENT status)", () => {
    const { container } = render(
      <HardwareScanChart
        deviceBrand="Apple"
        deviceModel="iPhone 15 Pro"
        issueType="screen"
      />
    );

    // Verify Title Header
    expect(container.textContent).toContain("ESTIMATED BATTERY CYCLE HEALTH");

    // Verify CHEMISTRY RETENTION tolerance message
    expect(
      container.textContent
    ).toContain("Chemistry retention retention is within acceptable tolerance levels.");

    // Verify Excellent Status
    expect(container.textContent).toContain("EXCELLENT");
    expect(container.textContent).toContain("94%");

    // Verify Default Tab is V-Rails (renders AreaChart with Apple data)
    const areaChart = container.querySelector('[data-testid="mock-area-chart"]');
    expect(areaChart).toBeInTheDocument();
    
    const chartData = JSON.parse(areaChart?.getAttribute("data-data") || "[]");
    expect(chartData).toHaveLength(6);
    expect(chartData[0].nominal).toBe(3.82);
    expect(chartData[0].active).toBe(3.81);
    expect(chartData[2].active).toBe(3.74); // Peak load drop check
  });

  it("renders degraded state when battery is the primary issueType", () => {
    const { container } = render(
      <HardwareScanChart
        deviceBrand="Samsung"
        deviceModel="Galaxy S24"
        issueType="battery"
      />
    );

    // Verify status warning message
    expect(
      container.textContent
    ).toContain("Battery degraded under nominal current series loads. Service required.");

    // Verify DEGRADED Status
    expect(container.textContent).toContain("DEGRADED");
    expect(container.textContent).toContain("76%");

    // Check custom gauge percent
    expect(container.textContent).toContain("76%");

    // Check default V-Rails layout displays Samsung voltage data
    const areaChart = container.querySelector('[data-testid="mock-area-chart"]');
    const chartData = JSON.parse(areaChart?.getAttribute("data-data") || "[]");
    expect(chartData[0].nominal).toBe(3.85); // Samsung nominal voltage bias
    expect(chartData[2].active).toBe(3.68); // samsung peak load drop check
  });

  it("handles Google / default brands correctly in mapping algorithms", () => {
    const { container } = render(
      <HardwareScanChart
        deviceBrand="Google"
        deviceModel="Pixel 8 Pro"
        issueType="button"
      />
    );

    // Verify Default / Google nominal voltage bias
    const areaChart = container.querySelector('[data-testid="mock-area-chart"]');
    const chartData = JSON.parse(areaChart?.getAttribute("data-data") || "[]");
    expect(chartData[0].nominal).toBe(3.80);
    expect(chartData[2].active).toBe(3.62);
  });

  it("switches to cycle metrics mode cleanly when clicking the tab", () => {
    const { container } = render(
      <HardwareScanChart
        deviceBrand="Apple"
        deviceModel="iPhone 15 Pro"
        issueType="battery"
      />
    );

    // Locate the tab switcher buttons
    const cycleTabButton = container.querySelector('button[role="button"]');
    expect(cycleTabButton).toBeInTheDocument();

    // Trigger state change via click interaction
    cycleTabButton?.dispatchEvent(new Event('click', { bubbles: true }));

    // Render area chart disappears, line chart appears
    const areaChartAfter = container.querySelector('[data-testid="mock-area-chart"]');
    expect(areaChartAfter).not.toBeInTheDocument();
    const lineChart = container.querySelector('[data-testid="mock-line-chart"]');
    expect(lineChart).toBeInTheDocument();

    // Verify the simulated health capacity degradation trend (baseHealth = 76)
    const chartData = JSON.parse(lineChart?.getAttribute("data-data") || "[]");
    expect(chartData).toHaveLength(5);
    expect(chartData[0].cycle).toBe("C-150");
    expect(chartData[0].capacity).toBe(78.5); // baseHealth (76) + 2.5
    expect(chartData[4].cycle).toBe("C-170");
    expect(chartData[4].capacity).toBe(76); // baseline health achieved
  });
});
