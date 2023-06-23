import {
  formatBallots,
  formatMatrix,
  formatRanking,
} from "./votingResultformatter";

test("maximal ballot", () => {
  const result = formatBallots([[["foo"], ["bar"]], [["foo"]]]);
  expect(result).toBe(`Ballots: 2
Preferences: 3`);
});

test("minimal matrix", () => {
  const result = formatMatrix({
    array: [
      [0, 2],
      [1, 0],
    ],
    candidates: ["foo", "bar"],
  });
  expect(result)
    .toBe(`[TABLE][TR][TD][/TD][TD][B]foo[/B][/TD][TD][B]bar[/B][/TD][/TR]
[TR][TD][B]foo[/B][/TD][TD]0[/TD][TD][B]2[/B][/TD][/TR]
[TR][TD][B]bar[/B][/TD][TD][I]1[/I][/TD][TD]0[/TD][/TR][/TABLE]`);
});

test("minimal ranking", () => {
  const result = formatRanking([["foo"], ["bar"]], []);

  expect(result).toBe(`1. foo
2. bar`);
});

test("ranking with cycle", () => {
  const result = formatRanking([["foo", "bar"]], []);

  expect(result).toBe("1. foo, bar");
});

test("ranking with one frontrunner", () => {
  const result = formatRanking([["foo"], ["bar"]], ["foo"]);

  expect(result).toBe(`1. foo
2. bar`);
});

test("ranking with two frontrunners", () => {
  const result = formatRanking([["foo"], ["bar"], ["baz"]], ["foo", "bar"]);

  expect(result).toBe(`1. foo [+]
2. bar [+]
3. baz`);
});
