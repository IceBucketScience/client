exports.getUnixTimestampFor = function(year, month, day) {
    return new Date(year, month - 1, day).getTime() / 1000
};