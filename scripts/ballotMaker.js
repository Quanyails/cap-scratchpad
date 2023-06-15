(() => {
    const ballots = Array.from($(".message-body"))
        // Remove OP
        .slice(1)
        .map(el => {
            // The part of the post that contains the ballot options is
            // the part of the post up to the first two newlines in that post,
            // or the full post if the user has no comments after the ballot.
            const text = el.innerText.trim();
            const ballotText = text.match(/(.*?)\n\n/s);
            const ballot = (ballotText ? ballotText[1] : text).split("\n");
            return ballot.map(line => line.trim());
        });

    const result = "poll://" + ballots.map(ballot => ballot.join(">")).join(",");

    console.log(result);
})();
