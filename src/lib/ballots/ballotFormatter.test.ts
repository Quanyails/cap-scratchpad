import {
  formatEricGorrBallots,
  formatPollkritterBallots,
} from "./ballotFormatter";

test("format Eric Gorr ballots", () => {
  const ballots = [
    [["foo"], ["bar", "baz"]],
    [["qux"], ["quux"], ["corge"]],
  ];
  const formatted = formatEricGorrBallots(ballots);
  expect(formatted).toBe(`foo>bar=baz
qux>quux>corge`);
});

// No test for formatting JSON ballots since that's just plain JSON

test("format Pollkritter ballots", () => {
  const ballots = [
    [["foo"], ["bar", "baz"]],
    [["qux"], ["quux"], ["corge"]],
  ];
  const formatted = formatPollkritterBallots(ballots);
  expect(formatted).toBe(`poll://foo>bar=baz,qux>quux>corge`);
});
