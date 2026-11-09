import { randomInt } from "node:crypto";

type Exclusion = {
  aId: string;
  bId: string;
};

function shuffle<T>(values: T[]): T[] {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapWith = randomInt(index + 1);
    [values[index], values[swapWith]] = [values[swapWith], values[index]];
  }

  return values;
}

/**
 * Finds a perfect matching where every participant gives exactly one gift and
 * receives exactly one gift. Exclusions are treated as mutual.
 *
 * This is a bipartite matching problem, solved with Kuhn's augmenting-path
 * algorithm. Randomising the adjacency lists and the giver order makes each
 * result unpredictable while still being exhaustive and fast.
 */
export function generateAssignments(
  participantIds: string[],
  exclusions: Exclusion[],
): Map<string, string> | null {
  const total = participantIds.length;

  if (total < 2) {
    return null;
  }

  const indexById = new Map(participantIds.map((id, index) => [id, index]));
  const blocked = Array.from({ length: total }, () => new Set<number>());

  for (const exclusion of exclusions) {
    const a = indexById.get(exclusion.aId);
    const b = indexById.get(exclusion.bId);

    if (a === undefined || b === undefined || a === b) {
      continue;
    }

    blocked[a].add(b);
    blocked[b].add(a);
  }

  const adjacency = participantIds.map((_, giver) => {
    const receivers: number[] = [];

    for (let receiver = 0; receiver < total; receiver += 1) {
      if (receiver !== giver && !blocked[giver].has(receiver)) {
        receivers.push(receiver);
      }
    }

    return shuffle(receivers);
  });

  if (adjacency.some((receivers) => receivers.length === 0)) {
    return null;
  }

  const receiverToGiver = new Array<number>(total).fill(-1);

  function assign(giver: number, visited: boolean[]): boolean {
    for (const receiver of adjacency[giver]) {
      if (visited[receiver]) {
        continue;
      }

      visited[receiver] = true;
      const currentGiver = receiverToGiver[receiver];

      if (currentGiver === -1 || assign(currentGiver, visited)) {
        receiverToGiver[receiver] = giver;
        return true;
      }
    }

    return false;
  }

  for (const giver of shuffle(participantIds.map((_, index) => index))) {
    const visited = new Array<boolean>(total).fill(false);

    if (!assign(giver, visited)) {
      return null;
    }
  }

  const assignments = new Map<string, string>();

  for (let receiver = 0; receiver < total; receiver += 1) {
    const giver = receiverToGiver[receiver];

    if (giver === -1) {
      return null;
    }

    assignments.set(participantIds[giver], participantIds[receiver]);
  }

  return assignments;
}
