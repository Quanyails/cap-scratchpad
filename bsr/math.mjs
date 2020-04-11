export const getMean = (...nums) => nums.reduce((acc, num) => acc + num, 0) / nums.length;

/**
 * Personal reference:
 * @see https://mathworld.wolfram.com/StandardDeviation.html
 * @see https://en.wikipedia.org/wiki/Bessel%27s_correction
 *
 * @param {"population" | "sample"} type
 * @param {number} nums
 * @returns {number}
 */
export const getStandardDeviation = (type, ...nums) => {
    const correctingFactor = (() => {
        switch (type) {
            case "population": {
                return 1;
            }
            case "sample": {
                return nums.length / (nums.length - 1);
            }
            default: {
                throw new Error(`Unexepected value for standard deviation type: ${type}`);
            }
        }
    })();

    const mean = getMean(...nums);
    const variance = nums
        .map(number => Math.pow(number - mean, 2))
        .reduce((acc, num) => acc + num, 0) / nums.length * correctingFactor;

    return Math.sqrt(variance);
};
