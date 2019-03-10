// Quad tree data structure with overlapping nodes
// Overlap ensures that queries for points near a
// certain center always returns ALL points within
// that overlap distance.

// Without this, queries of with a point near an edge
// of a node will miss some points.

// Current issues:
// When overlap is more than the node size, nodes miss
// some children

class OQuadTree {
    constructor(depth, overlap, minCoord, maxCoord) {
        this.depth = depth;

        if (!minCoord || !maxCoord) {
            minCoord = [0, 0];
            maxCoord = [1 << depth, 1 << depth];
        }

        this.minX = minCoord[0];
        this.maxX = maxCoord[0];

        this.minY = minCoord[1];
        this.maxY = maxCoord[1];

        const ox = Array.isArray(overlap) ? overlap[0] : overlap;
        const oy = Array.isArray(overlap) ? overlap[1] : overlap;
        this.overlapX = ox / (this.maxX - this.minX) * (1 << depth);
        this.overlapY = oy / (this.maxY - this.minY) * (1 << depth);

        this.nodes = [];
        this.leaves = [];
    }

    ensureNode(index) {
        if (!this.nodes[index])
            this.nodes[index] = new OQuadTree(this.depth - 1, [this.overlapX, this.overlapY]);
        return this.nodes[index];
    }
    mapCoordinates([x, y]) {
        return [
            (x - this.minX) / (this.maxX - this.minX) * (1 << this.depth),
            (y - this.minY) / (this.maxY - this.minY) * (1 << this.depth)
        ];
    }
    getNodeCoordinates([qx, qy]) {
        return [
            qx % (1 << (this.depth - 1)),
            qy % (1 << (this.depth - 1))
        ];
    }
    getNodeIndex(qx, qy) {
        return (qx >> (this.depth - 1)) + (qy >> (this.depth - 1)) * 2;
    }

    getLeavesNear([x, y]) {
        if (this.depth === 0) return this.leaves;

        const [qx, qy] = this.mapCoordinates([x, y]);

        const [nodeX, nodeY] = this.getNodeCoordinates([qx, qy]);
        const i = this.getNodeIndex(qx, qy);

        if (!this.nodes[i]) return [];
        else return this.nodes[i].getLeavesNear([nodeX, nodeY]);
    }

    addLeaf([x, y], value) {
        if (this.depth === 0) {
            this.leaves.push(value);
            return;
        }

        const [qx, qy] = this.mapCoordinates([x, y]);

        const mx = 1 << (this.depth - 1);
        const my = mx;

        const tx = qx >> (this.depth - 1);
        const ty = qy >> (this.depth - 1);

        const addToQxQy = (cx, cy) => {
            const i = this.getNodeIndex(cx, cy);
            this.ensureNode(i).addLeaf(this.getNodeCoordinates([cx, cy]), value);
        }

        // Edge crossing check
        const qx2 = tx === 0 ? qx + this.overlapX : qx - this.overlapX;
        const qy2 = ty === 0 ? qy + this.overlapY : qy - this.overlapY;
        const xValid = (tx === 0 && qx2 >= mx) || (tx === 1 && qx2 <= mx);
        const yValid = (ty === 0 && qy2 >= my) || (ty === 1 && qy2 <= my);
        if (xValid) addToQxQy(qx2, qy);
        if (yValid) addToQxQy(qx, qy2);
        if (xValid && yValid) addToQxQy(qx2, qy2);

        addToQxQy(qx, qy);
    }

    pruneForDisplay() {
        if (this.depth === 0) {
            return {
                depth: 0,
                leaves: this.leaves
            };
        }

        const nodes = this.nodes.map(node => node.pruneForDisplay());
        return {
            depth: this.depth,
            nodes,
        };
    }
}

module.exports = OQuadTree;