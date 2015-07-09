// geo-utils: utilities for geometry related things

// TODO: implement vec2, or use a vector library
// TODO: and then refactor all the code to use vectors instead of coordinates
module.exports = {

  dist(x1, y1, x2, y2) {
    let dx = x1 - x2;
    let dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  },

  getBox(x1, y1, x2, y2) {
    let left = Math.min(x1, x2);
    let right = Math.max(x1, x2);
    let top = Math.min(y1, y2);
    let bottom = Math.max(y1, y2);

    return {
      left: left,
      right: right,
      top: top,
      bottom: bottom,
      corners: [
        [left, top], [left, bottom], [right, top], [right, bottom]
      ].map( c => { return {x: c[0], y: c[1]}; } )
    };
  },

  inBounds(p, box) {
    return (
         p.x >= box.left
      && p.x <= box.right
      && p.y >= box.top
      && p.y <= box.bottom
    );
  }

};
