(() => {
    const altFormes = [
        "pikachucosplay",
        "pikachuhoenn",
        "pikachusinnoh",
        "pikachuunova",
        "pikachukalos",
        "pikachualola",
        "pikachupartner",
        "pikachuworld",
        "zarudedada",
    ];

    const caps = [
        "syclar",
        "syclant",
        "revenankh",
        "rebble",
        "tactite",
        "stratagem",
        "breezi",
        "fidgit",
        "privatyke",
        "arghonaut",
        "nohface",
        "kitsunoh",
        "monohm",
        "duohm",
        "cyclohm",
        "cyclohm-f",
        "colosshale",
        "colossoil",
        "protowatt",
        "krilowatt",
        "voodoll",
        "voodoom",
        "scratchet",
        "tomohawk",
        "necturna",
        "mollux",
        "cupra",
        "argalis",
        "aurumoth",
        "brattler",
        "malaconda",
        "cawdet",
        "cawmodore",
        "volkritter",
        "volkraken",
        "snugglow",
        "plasmanta",
        "floatoy",
        "caimanoe",
        "naviathan",
        "crucibelle",
        "crucibelle-mega",
        "pluffle",
        "kerfluffle",
        "pajantom",
        "mumbao",
        "jumbao",
        "fawnifer",
        "electrelk",
        "caribolt",
        "smogecko",
        "smoguana",
        "smokomodo",
        "swirlpool",
        "coribalis",
        "snaelstrom",
        "justyke",
        "equilibra",
        "solotl",
        "astrolotl",
        "miasmite",
        "miasmaw",
    ];

    const skipped = ["floetteeternal", "missingno"];

    const whatLearnsWhat = {};
    Object.keys(BattleLearnsets).forEach((pokemonId) => {
        if (skipped.includes(pokemonId)) {
            return;
        }
        if (altFormes.includes(pokemonId) || caps.includes(pokemonId)) {
            return;
        }
        if (
            pokemonId.startsWith("pokestar") ||
            pokemonId.endsWith("original") ||
            pokemonId.endsWith("starter") ||
            pokemonId.endsWith("totem")
        ) {
            return;
        }

        const { learnset } = BattleLearnsets[pokemonId];
        learnset &&
        Object.keys(learnset).forEach((move) => {
            if (whatLearnsWhat[move]) {
                whatLearnsWhat[move].push(pokemonId);
            } else {
                whatLearnsWhat[move] = [pokemonId];
            }
        });
    });

    const frequencies = {};
    Object.entries(whatLearnsWhat).forEach(([move, whatLearns]) => {
        frequencies[move] = whatLearns.length;
    });
    console.log(frequencies);
})();
