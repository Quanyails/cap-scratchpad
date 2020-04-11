/**
 * Examples of how to use the modules in this directory.
 */

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
    console.log("BSR rating:", getMagicBsr(stats));
};

const main = () => {
    dumpPokemonStatsExample();
    // getBsrExample();
};

main();
