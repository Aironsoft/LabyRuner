function Grid(arrayMazeMap, width, height) {
    
    this.Direction =
    {
        N: 1, S: 2, E: 4, W: 8, U: 16, Cursor: 32,
        Mask: 1 | 2 | 4 | 8 | 16,
        List: [1, 2, 4, 8],
        dx: { 1: 0, 2: 0, 4: 1, 8: -1 },
        dy: { 1: -1, 2: 1, 4: 0, 8: 0 },
        opposite: { 1: 2, 2: 1, 4: 8, 8: 4 },
        cross: { 1: 4 | 8, 2: 4 | 8, 4: 1 | 2, 8: 1 | 2 }
    };
    
    this.data = arrayMazeMap;
    this.at = function (b, c) {
        return this.data[c][b]
    };
    
    this.clear = function (b, d, c) {
        return this.data[d][b] &= ~c
    };
    this.isMarked = function (b, d, c) {
        return (this.data[d][b] & c) === c
    };
    
    this.isEast = function (b, c) {
        return this.isMarked(b, c, this.Direction.E)
    };
    this.isWest = function (b, c) {
        return this.isMarked(b, c, this.Direction.W)
    };
    this.isNorth = function (b, c) {
        return this.isMarked(b, c, this.Direction.N)
    };
    this.isSouth = function (b, c) {
        return this.isMarked(b, c, this.Direction.S)
    };
    this.isUnder = function (b, c) {
        return this.isMarked(b, c, this.Direction.U)
    };
    this.isValid = function (b, c) {
        return (0 <= b && b < width) && (0 <= c && c < height)
    };
    
    this.getClassName = function (x, y) {
        r = [];
        if (this.algorithm.isCurrent(x, y)) {
            r.push("cursor")
        }
        if (!this.isBlank(x, y)) {
            r.push("in");
        }
        if (this.isEast(x, y)) {
            r.push("e")
        }
        if (this.isWest(x, y)) {
            r.push("w")
        }
        if (this.isSouth(x, y)) {
            r.push("s")
        }
        if (this.isNorth(x, y)) {
            r.push("n")
        }
        if (this.isUnder(x, y)) {
            r.push("u")
        }
        
        var res = "";
        
        for (e in r) res += e + " ";
        
        
        return r;
    };
}

function renderGrid(arrayMazeMap, id, width, height) {
    var q, u, r, A, z, w, v, t, s;
    var grid = new Grid(arrayMazeMap, width, height);
    q = "<div class='grid' id='" + r + "'>";
    for (w = 0, v = height; (0 <= v?w < v:w > v); (0 <= v?w += 1:w -= 1)) {
        r = "" + id + "_y" + w;
        q += "<div class='row' id='" + r + "'>";
        
        for (z = 0, t = width; (0 <= t?z < t:z > t); (0 <= t?z += 1:z -= 1)) {
            className = getClassName(grid, w, z);
            q += "<div id='" + r + "x" + z + "' class='" + className + "'>";
        }
        q += "</div>";
    }
    
    q += "</div></div>";
    
    return q;
}

function KeyHandler(idPrefix) {
    var direction = 0;
    this.onKeyDown = function (e) {
        if (e.keyCode === 'w'.charCodeAt(0))
            direction = 1;
        if (e.keyCode === 's'.charCodeAt(0))
            direction = 2;
        if (e.keyCode === 'a'.charCodeAt(0))
            direction = 3;
        if (e.keyCode === 'd'.charCodeAt(0))
            direction = 4;
        
     


    };



}