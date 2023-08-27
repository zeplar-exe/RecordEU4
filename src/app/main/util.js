function addDays(date, days) {
    const result = new Date(date);

    result.setDate(result.getDate() + days);

    return result;
}

function createColorKey(r, g, b, a) {
    return `${r}_${g}_${b}_${a}`
}

module.exports = { addDays, createColorKey }