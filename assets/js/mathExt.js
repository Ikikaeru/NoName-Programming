class MathExt {
    /**
     * Compute the remainder of a / b.
     * @param {number} a What we want the remainder from.
     * @param {number} b What's dividing a.
     * @returns A value between 0 (included) and the remainder of the divisor (not included).
     */
    static modulo(a, b)
    {
        return a - Math.floor(a / b) * b;
    }
}