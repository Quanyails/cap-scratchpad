/**
 * Shared code for manipulating Pokemon stats.
 */

import {USABLE_POKEMON} from "./usablePokemon.mjs";

/**
 * Given a set of base speeds, produces a mapping from all possible base speeds
 * to how many Pokemon you will outspeed.
 *
 * @param {number} baseSpeeds All possible base speeds available in the game.
 * @returns {number[]} A mapping from base speed to # of Pokemon outsped with that base speed.
 */
const getBaseSpeedFactors = (baseSpeeds) => {
    const baseSpeedFactors = [];

    for (let i = 0; i < 256; i++) {
        baseSpeedFactors[i] = baseSpeeds.filter(s => s < i).length;
    }
    return baseSpeedFactors;
};

const baseSpeedFactors = getBaseSpeedFactors(
    USABLE_POKEMON.map(pokemon => pokemon.baseStats.spe)
);

/**
 * @param {Stats} stats The base stats of the Pokemon.
 * @returns {Stats} The "real", or effective stats of the Pokemon, assuming:
 *  * level 100
 *  * perfect IVs
 *  * no EVs
 *  * neutral nature
 *
 *  HP derivation:
 *          floor((2 * base + iv + floor(ev / 4)) * (level / 100)) + level + 10 (original formula)
 *          floor((2 * base + 31 + 0) * 1 + 100 + 10
 *          floor(2 * base + 31) + 110
 *          2 * base + 31 + 110 (as base is always integer, floor(2 * base + 31) is always an integer)
 *          2 * base + 141
 *  Attack/Defense derivation:
 *      (floor((2 * base + iv + floor(ev / 4)) * (level / 100)) + 5) * nature (original formula)
 *      (floor((2 * base + 31 + 0) * 1) + 5) * 1
 *      floor(2 * base + 31) + 5
 *      2 * base + 31 + 5 (as base is always integer, floor(2 * base + 31) is always an integer)
 *      2 * base + 36
 *  Speed derivation:
 *      As the stat formula is monotonic, and only the larger of any two speeds
 *      determines turn priority, we can simply rank base speeds against each other to determine
 *      what effect they have against another Pokemon in battle.
 *      This is normalized to a number between 0 and 1.
 *
 * @see https://www.smogon.com/smog/issue6/base_stats
 */
export const getEffectiveStats = ({
                               hp,
                               atk,
                               def,
                               spa,
                               spd,
                               spe,
                           }) => {
    return {
        hp: hp * 2 + 141, // personal note: / 8 to use normalized value according to sweeptank paper
        atk: atk * 2 + 36, // personal note: / 2 to use normalized value according to sweeptank paper
        def: def * 2 + 36, // personal note: / 2 to use normalized value according to sweeptank paper
        spa: spa * 2 + 36, // personal note: / 2 to use normalized value according to sweeptank paper
        spd: spd * 2 + 36, // personal note: / 2 to use normalized value according to sweeptank paper
        spe: baseSpeedFactors[spe] / USABLE_POKEMON.length,
    };
};
