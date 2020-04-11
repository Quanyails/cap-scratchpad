import {getMean, getStandardDeviation} from "./math.mjs";
import {getEffectiveStats} from "./stats.mjs";
import {USABLE_POKEMON} from "./usablePokemon.mjs";

/**
 * Interface representing the four values making a Pokemon's rating.
 *
 * @interface Rating
 * @property {number} ps physical sweepiness
 * @property {number} pt physical tankiness
 * @property {number} ss special sweepiness
 * @property {number} st special tankiness
 */

const expectedEffectiveAttack = 300;
const expectedTurnsToKo = 1.5;
const metagameStalliness = expectedEffectiveAttack * expectedTurnsToKo;

// Since we normalize ratings in finding BSR, this scaling factor cancels out.
// See Page 6 of X-Act's PDF for explanation.
// In practice, this value is used make the values for tankiness nice-looking.
// In Gen. IV, this was 35.
// In Gen. V, this was 1.
const prettinessFactor = 1;

const getSweepiness = (eAtk, eSpe) => {
    return eAtk * (eAtk * eSpe + metagameStalliness) /
        (eAtk * (1 - eSpe) + metagameStalliness);
};

const getTankiness = (eHp, eDef) => {
    return eHp * eDef / prettinessFactor;
};

/**
 * @param {Stats} stats
 * @returns {Rating}: The absolute rating of Pokemon's stats.
 */
const getRating = (stats) => {
    const {
        hp: eHp,
        atk: eAtk,
        def: eDef,
        spa: eSpa,
        spd: eSpd,
        spe: eSpe,
    } = getEffectiveStats(stats);
    return {
        ps: getSweepiness(eAtk, eSpe),
        pt: getTankiness(eHp, eDef),
        ss: getSweepiness(eSpa, eSpe),
        st: getTankiness(eHp, eSpd),
    };
};

const USABLE_POKEMON_RATINGS = USABLE_POKEMON.map((pokemon) => getRating(pokemon.baseStats));

const psList = USABLE_POKEMON_RATINGS.map(rawRating => rawRating.ps);
const ptList = USABLE_POKEMON_RATINGS.map(rawRating => rawRating.pt);
const ssList = USABLE_POKEMON_RATINGS.map(rawRating => rawRating.ss);
const stList = USABLE_POKEMON_RATINGS.map(rawRating => rawRating.st);

const ratingMeans = {
    ps: getMean(...psList),
    pt: getMean(...ptList),
    ss: getMean(...ssList),
    st: getMean(...stList),
};

const ratingStds = {
    ps: getStandardDeviation("population", ...psList),
    pt: getStandardDeviation("population", ...ptList),
    ss: getStandardDeviation("population", ...ssList),
    st: getStandardDeviation("population", ...stList),
};

/**
 * @param {Stats} stats
 * @returns {Rating} The normalized (relative) rating of the Pokemon's stats,
 *  where each number represents the # of standard deviations from the norm.
 */
const getNormalizedRatings = (stats) => {
    const rating = getRating(stats);

    return {
        ps: (rating.ps - ratingMeans.ps) / ratingStds.ps,
        pt: (rating.pt - ratingMeans.pt) / ratingStds.pt,
        ss: (rating.ss - ratingMeans.ss) / ratingStds.ss,
        st: (rating.st - ratingMeans.st) / ratingStds.st,
    };
};

/**
 * @param {Stats} stats
 * @returns {Ratings & {odb: number, psb: number, rating: number}}
 *  The normalized (relative) BSR of the Pokemon's stats.
 */
const getNormalizedBsr = (stats) => {
    const normalizedRatings = getNormalizedRatings(stats);
    const {
        ps,
        pt,
        ss,
        st,
    } = normalizedRatings;

    return {
        ...normalizedRatings,
        odb: Math.log(Math.max(ps, ss) / Math.max(pt, st)),
        psb: Math.log((ps * pt) / (ss * st)),
        rating: getMean(ps, pt, ss, st),
    }
};

/**
 * @param {Stats} stats
 * @returns {Ratings & {odb: number, psb: number, rating: number}}
 *  The prettified version of the BSR of the Pokemon's stats.
 */
const getPrettyBsr = (stats) => {
    const normalizedBsr = getNormalizedBsr(stats);

    return {
        // ps/pt/ss/st have a mean of 100 and SD of 50
        ps: 100 + normalizedBsr.ps * 50,
        pt: 100 + normalizedBsr.pt * 50,
        ss: 100 + normalizedBsr.ss * 50,
        st: 100 + normalizedBsr.st * 50,
        // leans have a mean of 0 and a SD of 50
        odb: normalizedBsr.odb * 50,
        psb: normalizedBsr.psb * 50,
        // rating has a mean of 200 and a SD of 100
        rating: 200 + normalizedBsr.rating * 100,
    };
};


export const getBsr = getPrettyBsr;
