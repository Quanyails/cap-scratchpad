/**
 * Examples of how to use the modules in this directory.
 */

import {getBsr} from "./bsrFormulaFinder.mjs";
import {getMagicBsr} from "./bsrMagicFormulaFinder.mjs";
import {USABLE_POKEMON} from "./usablePokemon.mjs";

const dumpPokemonStatsExample = () => {
    USABLE_POKEMON.forEach((pokemon) => {
        const {
            baseStats: {
                hp,
                atk,
                def,
                spa,
                spd,
                spe,
            },
            name,
        } = pokemon;

        console.log([name, hp, atk, def, spa, spd, spe].join(","));
    });
};

const dumpPokemonBsrsExample = () => {
    USABLE_POKEMON.forEach((pokemon) => {
        const {
            baseStats,
            name,
        } = pokemon;

        const {
            ps,
            pt,
            ss,
            st,
            rating,
        } = getBsr(baseStats);

        console.log([name, ps, pt, ss, st, rating,].join(","));
    });
};

const getBsrExample = () => {
    const stats = {
        hp: 100,
        atk: 100,
        def: 100,
        spa: 100,
        spd: 100,
        spe: 100,
    };

    console.log("Base stats:", stats);
    console.log("Magic BSR rating:", getMagicBsr(stats));
    console.log("Modern BSR rating:", getBsr(stats));
};

const main = () => {
    dumpPokemonStatsExample();
    // dumpPokemonBsrsExample();
    // getBsrExample();
};

main();
