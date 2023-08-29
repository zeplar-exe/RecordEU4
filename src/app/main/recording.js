module.exports = class Recording {
    constructor(name, directory, data) {
        this.name = name
        this.directory = directory
        this.data = data
        this.province_map = {}
    }

    mapProvincePixelIndex(province, pixelIndex) {
        if (!this.province_map.hasOwnProperty(province))
            this.province_map[province] = [pixelIndex]
        else
            this.province_map[province].push(pixelIndex)
    }

    getProvincePixelIndices(province) {
        return this.province_map[province]
    }
}