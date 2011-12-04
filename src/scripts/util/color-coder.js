function DefaultColorCoder() {
    this._colorMap = {};
    this._colorMax = 0;
}

DefaultColorCoder.defaultColors = [
    "#FF9000",
    "#5D7CBA",
    "#A97838",
    "#8B9BBA",
    "#FFC77F",
    "#003EBA",
    "#29447B",
    "#543C1C"
];

DefaultColorCoder.prototype.getColorForKey = function(key) {
    if (key in this._colorMap) {
        return this._colorMap[key];
    } else {
        var color = this._colorMap[key] = DefaultColorCoder.defaultColors[this._colorMax];
        
        this._colorMax = (this._colorMax + 1) % DefaultColorCoder.defaultColors.length;
        
        return color;
    }
};

DefaultColorCoder.prototype.getDefaultColor = function() {
    return "#FF9000";
};