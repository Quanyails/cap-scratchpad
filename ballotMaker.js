(() => {
    const names = ``.split("\n");

    const ballots = Array.from($(".message-body"))
        .map(el => {
            const lines = el.innerText.trim().split("\n");
            return lines
                .map(line => line.trim())
                .filter(line => names.includes(line))
                ;
        })
        // Remove OP
        .slice(1);

    const result = "poll://" + ballots.map(ballot => ballot.join(">")).join(",");

    console.log(result);
})();