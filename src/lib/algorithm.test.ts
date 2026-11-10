import { describe, expect, it } from "vitest";
import { generateAssignments } from "./algorithm";

type Exclusion = { aId: string; bId: string };

function ids(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `p${index}`);
}

function expectValid(
  participantIds: string[],
  exclusions: Exclusion[],
  assignments: Map<string, string> | null,
) {
  expect(assignments).not.toBeNull();
  const map = assignments as Map<string, string>;
  expect(map.size).toBe(participantIds.length);
  expect(new Set(map.values()).size).toBe(participantIds.length);

  for (const id of participantIds) {
    expect(map.get(id)).not.toBe(id);
  }

  for (const exclusion of exclusions) {
    expect(map.get(exclusion.aId)).not.toBe(exclusion.bId);
    expect(map.get(exclusion.bId)).not.toBe(exclusion.aId);
  }
}

describe("generateAssignments", () => {
  it("returns null with fewer than two participants", () => {
    expect(generateAssignments([], [])).toBeNull();
    expect(generateAssignments(["a"], [])).toBeNull();
  });

  it("handles two participants", () => {
    const assignments = generateAssignments(["a", "b"], []);
    expect(assignments?.get("a")).toBe("b");
    expect(assignments?.get("b")).toBe("a");
  });

  it("creates a derangement for three participants", () => {
    const participantIds = ids(3);
    expectValid(participantIds, [], generateAssignments(participantIds, []));
  });

  it("respects mutual exclusions", () => {
    const participantIds = ids(5);
    const exclusions = [{ aId: "p0", bId: "p1" }];

    for (let run = 0; run < 20; run += 1) {
      expectValid(
        participantIds,
        exclusions,
        generateAssignments(participantIds, exclusions),
      );
    }
  });

  it("returns null when two participants cannot gift each other", () => {
    expect(
      generateAssignments(["a", "b"], [{ aId: "a", bId: "b" }]),
    ).toBeNull();
  });

  it("returns null when three participants mutually exclude each other", () => {
    expect(
      generateAssignments(["a", "b", "c"], [
        { aId: "a", bId: "b" },
        { aId: "a", bId: "c" },
        { aId: "b", bId: "c" },
      ]),
    ).toBeNull();
  });

  it("returns null when a single exclusion makes three participants impossible", () => {
    expect(
      generateAssignments(["a", "b", "c"], [{ aId: "a", bId: "b" }]),
    ).toBeNull();
  });

  it("handles larger groups", () => {
    const participantIds = ids(50);
    const exclusions = Array.from({ length: 20 }, (_, index) => ({
      aId: `p${index}`,
      bId: `p${(index + 1) % 50}`,
    }));

    expectValid(
      participantIds,
      exclusions,
      generateAssignments(participantIds, exclusions),
    );
  });

  it("produces different assignments across repeated runs", () => {
    const participantIds = ids(6);
    const results = new Set<string>();

    for (let run = 0; run < 20; run += 1) {
      const assignments = generateAssignments(participantIds, []);
      expectValid(participantIds, [], assignments);
      results.add(
        participantIds
          .map((id) => `${id}:${assignments?.get(id)}`)
          .sort()
          .join("|"),
      );
    }

    expect(results.size).toBeGreaterThan(1);
  });
});
