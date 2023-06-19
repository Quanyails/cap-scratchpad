import { Matrix } from "votes";
import { Message } from "../../message";
import { Ballot } from "../ballots/ballots";

const listFormatter = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction",
});

export const formatBallots = (ballots: Ballot[]) => {
  return [
    `${Message.Ballots} ${ballots.length}`,
    `${Message.Preferences} ${ballots.flat(2).length}`,
  ].join("\n");
};

export const formatMatrix = ({ array, candidates }: Matrix) => {
  const boldedCandidates = candidates.map((c) => `[B]${c}[/B]`);
  const labeledTable = [
    ["", ...boldedCandidates],
    ...array.map((row, i) => [boldedCandidates[i], ...row.map((r) => `${r}`)]),
  ];
  return `[TABLE]${labeledTable
    .map((row) => {
      const cells = row.map((value) => `[TD]${value}[/TD]`);
      return `[TR]${cells.join("")}[/TR]`;
    })
    .join("\n")}[/TABLE]`;
};

export const formatRanking = (ranking: string[][], frontrunners: string[]) => {
  return ranking
    .map((row, i) => {
      return row.length === 1 &&
        frontrunners.length > 1 &&
        frontrunners.includes(row[0])
        ? `${i + 1}. ${row.join(", ")} [+]`
        : `${i + 1}. ${row.join(", ")}`;
    })
    .join("\n");
};

export const formatScores = (
  ranking: string[][],
  scores: Record<string, number>
) => {
  return ranking
    .map((row, i) => `${i + 1}. ${row.join(", ")} (${scores[row[0]]})`)
    .join("\n");
};

export const formatSmithSet = (matrix: Matrix) => {
  return `${Message.SmithSet} ${listFormatter.format(matrix.candidates)}.`;
};

export const getBordaCountHeader = () => {
  return [Message.Divider, Message.BordaCount, Message.Divider].join("\n");
};

export const getRundownHeader = () => {
  return [Message.Divider, Message.Rundown.toUpperCase(), Message.Divider].join(
    "\n"
  );
};
