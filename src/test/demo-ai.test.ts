import { describe, expect, it } from "vitest";
import { demoMeeting, priorityOf } from "@/lib/demo-ai";

describe("demo AI rules", () => {
  it("marks missing owner and deadline as Not specified", () => {
    const r = demoMeeting("We need to prepare the slides.");
    expect(r.actions[0]?.owner).toBe("Not specified");
    expect(r.actions[0]?.deadline).toBe("Not specified");
  });
  it("tasks due within a day are High priority", () => {
    const now = new Date("2026-10-21T08:00:00");
    expect(priorityOf({ id: "1", title: "x", deadline: "2026-10-21", minutes: 30, done: false }, now)).toBe("High");
  });
});
