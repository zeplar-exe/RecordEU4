const os = require("os")

module.exports = class Color {
    constructor(r = 0, g = 0, b = 0, a = 255) {
        this.r = r
        this.g = g
        this.b = b
        this.a = a
    }

    asUint32() {
        if (os.endianness() === "LE") {
            return ((this.a << 24) |	// alpha
                   (this.b << 16)  |	// blue
                   (this.g <<  8)  |	// green
                   (this.r))            // red
                    >>> 0               // unsigned
        } else {
            return ((this.r << 24) |    // red
                   (this.g << 16)  |	// green
                   (this.b <<  8)  |	// blue
                   (this.a))            // alpha
                    >>> 0               // unsigned
        }
    }

    equals(other) {
        return this.r === other.r && this.g === other.g && this.b === other.b && this.a === other.a
    }
}