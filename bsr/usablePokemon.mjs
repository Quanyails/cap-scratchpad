import pokedex from "./pokedex.mjs";
import * as _ from "./underscore.mjs";

/**
 * Interface representing the six stats a Pokemon has.
 *
 * @interface Stats
 * @property {number} hp
 * @property {number} atk
 * @property {number} def
 * @property {number} spa
 * @property {number} spd
 * @property {number} spe
 */

/**
 * The definition of a Pokemon the Pokemon Showdown repository uses.
 *
 * @interface Pokemon
 * @property {Object.<string, string>} abilities
 * @property {Stats} baseStats
 * @property {string} color
 * @property {string[]} eggGroups
 * @property {number} heightm
 * @property {string} name
 * @property {number} num
 * @property {string} tier
 * @property {string[]} types
 * @property {number} weightkg
 *
 * @property {string | undefined} baseForme
 * @property {string | undefined} baseSpecies
 * @property {string | undefined} battleOnly
 * @property {boolean | undefined} canHatch
 * @property {string[] | undefined} cosmeticFormes
 * @property {string | undefined} forme
 * @property {string | undefined} evoCondition
 * @property {string | undefined} evoItem
 * @property {number | undefined} evoLevel
 * @property {string | undefined} evoMove
 * @property {string[] | undefined} evos
 * @property {string | undefined} evoType
 * @property {number | undefined} gen
 * @property {string | undefined} gender
 * @property {string | undefined} inheritsFrom
 * @property {string | undefined} isGigantamax
 * @property {string | undefined} isNonstandard
 * @property {number | undefined} maxHP
 * @property {string[] | undefined} otherFormes
 * @property {string | undefined} prevo
 * @property {string | undefined} requiredAbility
 * @property {string | undefined} requiredMove
 * @property {string | undefined} requiredItem
 * @property {boolean | undefined} unreleasedHidden
 */

/**
 * Creates a copy of the Pokedex with small errors corrected.
 *
 * @param {Object.<string, Pokemon>} pokedex
 * @returns {Object.<string, Pokemon>}
 */
const fixPokedexData = (pokedex) => {
    const fixedPokemon = {
        ...pokedex
    };

    // Other Mega Pokemon are listed as past-gen-only, but Mega Crucibelle is not.
    fixedPokemon.crucibellemega = {
        ...pokedex.crucibellemega,
        isNonstandard: "Past",
        tier: "Illegal",
    };

    // Justyke is currently not implemented
    fixedPokemon.justyke = {
        num: -55,
        name: "Justyke",
        types: ["Steel", "Ground"],
        gender: "N",
        baseStats: {hp: 72, atk: 70, def: 56, spa: 83, spd: 68, spe: 30},
        abilities: {"0": "Levitate", "1": "Bulletproof", H: "Justified"},
        heightm: 0, // not defined?
        weightkg: 0, // not defined?
        color: "Brown",
        eggGroups: ["Mineral"],
        gen: 7,
        tier: "CAP",
        isNonstandard: "CAP",
    };

    return fixedPokemon;
};

/**
 * If all of these Pokemon properties match on one of a Pokemon's formes,
 * we consider a Pokemon a duplicate of the base forme.
 */
const duplicateRelevantProperties = ["abilities", "baseStats", "types"];

/**
 * @param {Object.<string, Pokemon>} pokedex
 * @returns {Object.<string, Pokemon>} A mapping of Pokemon with Pokemon
 *  considered to be duplicates of the Pokemon (e.g., cosmetic formes) removed.
 */
const filterDuplicates = (pokedex) => {
    const filteredPokedex = {
        ...pokedex
    };

    Object.keys(pokedex).forEach(pokemonId => {
        const pokemon = pokedex[pokemonId];

        const otherFormeIds = [];

        if (pokemon.otherFormes) {
            pokemon.otherFormes.forEach(formeId => {
                otherFormeIds.push(formeId);
            });
        }

        otherFormeIds.forEach(formeId => {
            const forme = pokedex[formeId];

            if (_.isEqual(
                _.pick(pokemon, ...duplicateRelevantProperties),
                _.pick(forme, ...duplicateRelevantProperties),
            )) {
                delete filteredPokedex[formeId];
            }
        })
    });
    return filteredPokedex;
};

/**
 * @param {Object.<string, Pokemon>} pokedex
 * @returns {Pokemon[]>} A list of Pokemon that are usable for BSR calculation.
 */
const getUsablePokemon = (pokedex) => {
    const fixedPokedex = fixPokedexData(pokedex);
    const deduplicatedPokedex = filterDuplicates(fixedPokedex);

    return Object.values(deduplicatedPokedex).filter(pokemon => {
        if ([
            "Illegal",
            // "LC",
            // "LC Uber",
            // "NFE",
            // "Uber",
            // "(Uber)",
            "Unreleased",
        ].includes(pokemon.tier)) {
            return false;
        }
        if (pokemon.isNonstandard === "Past") {
            return false;
        }

        // Sword/Shield edge cases
        if ([
            // Formes of formes have weird logic
            // "Darmanitan-Galar-Zen",
            // Was filtered out in past-gen BSR calculators--could include again
            "Meowstic-F",
            // Only difference is that they can use Pikashunium Z, an old-gen item
            "Pikachu-Original",
            "Pikachu-Hoenn",
            "Pikachu-Sinnoh",
            "Pikachu-Unova",
            "Pikachu-Kalos",
            "Pikachu-Alola",
            "Pikachu-Partner",
            // Abilities have different names but same effect
            "Toxtricity-Low-Key",
            // Prevents excessive weighting
            "Silvally-Bug",
            "Silvally-Dark",
            "Silvally-Dragon",
            "Silvally-Electric",
            "Silvally-Fairy",
            "Silvally-Fighting",
            "Silvally-Fire",
            "Silvally-Flying",
            "Silvally-Ghost",
            "Silvally-Grass",
            "Silvally-Ground",
            "Silvally-Ice",
            "Silvally-Poison",
            "Silvally-Psychic",
            "Silvally-Rock",
            "Silvally-Steel",
            "Silvally-Water",
        ].includes(pokemon.name)) {
            return false;
        }

        return true;
    });
};

export const USABLE_POKEMON = getUsablePokemon(pokedex);
