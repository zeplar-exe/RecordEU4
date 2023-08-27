module.exports = class Recording {
    constructor(name, directory, data) {
        this.name = name
        this.directory = directory
        this.data = data
        this.province_map = {}
    }

    mapProvincePixelIndex(province, bitmap_index) {
        if (!this.province_map.hasOwnProperty(province))
            this.province_map[province] = bitmap_index
    }

    getProvincePixelIndex(province) {
        return this.province_map[province]
    }
}