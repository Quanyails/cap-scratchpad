/**
 * Gen. IV magic formula decompiled from X-Act's BSR Java applet.
 *
 * The logic for the calculator can be found in the file FindStatsHandler.class.
 * Decompiling the file was done by opening it in IntelliJ 2019.
 *
 * THIS FORMULA IS FOR REFERENCE PURPOSES ONLY.
 * The math in this module is derived from Gen. IV,
 * but getEffectiveStats() is derived from the most recent Pokemon generation,
 * so the numbers that will be outputted will not be standardized correctly.
 */

import {getEffectiveStats} from "./stats.mjs";

export const getMagicBsr = (stats) => {
    const {
        hp: eHP,
        atk: eAtk,
        def: eDef,
        spa: eSpa,
        spd: eSpD,
        spe: eSpe,
    } = getEffectiveStats(stats);

    const pt = eHP * eDef / 417.5187 - 18.9256;
    const st = eHP * eSpD / 434.8833 - 13.9044;
    const ps = eAtk * (eAtk * eSpe + 415.0)
        / (1.855522 * (eAtk * (1.0 - eSpe) + 415.0)) - 4.36533;
    const ss = eSpa * (eSpa * eSpe + 415.0)
        / (1.947004 * (eSpa * (1.0 - eSpe) + 415.0)) + 4.36062;
    const odb = (Math.max(ps, ss) - Math.max(pt, st)) / 6.243721 - 0.326255;
    const psb = (pt - st + (ps - ss)) / 6.840256;
    const rating = (pt + st + ps + ss) / 1.525794 - 62.1586;

    return {
        pt,
        st,
        ps,
        ss,
        odb,
        psb,
        rating,
    };
};
