'use strict';

// there's probably a better way to do this but....
function getCSS(namespace, i) {
  return `
    #${namespace} .outline {
      stroke: black;
      stroke-width: 0.3;
    }
    #${namespace} .face .skin {
      fill: white;
    }
    #${namespace} .face .hair {
      fill: black;
    }
    #${namespace} .eye {
      fill: ${i === 0 ? 'black' : 'blue'};
    }
    #${namespace} .torso {
      fill: white;
    }
    #${namespace} .neck .odd {
      fill: white;
    }
    #${namespace} .neck .scarf1 {
      fill: #F44336;
    }
    #${namespace} .neck .scarf3 {
      fill: #8BC34A;
    }
    #${namespace} .neck .scarf5 {
      fill: #2196F3;
    }
    #${namespace} .hat .ball {
      fill: black;
    }
    #${namespace} .hat .top {
      fill: white;
    }
    #${namespace} .hat .bottom {
      stroke: black;
      stroke-width: 1;
      stroke-linecap: round;
    }
    #${namespace} .sled {
      fill: white;
    }
    #${namespace} .arm .sleeve {
      fill: black;
    }
    #${namespace} .arm .hand {
      fill: white;
    }
    #${namespace} .leg .pants {
      fill: black;
    }
    #${namespace} .leg .foot {
      fill: white;
    }
  `;
}

module.exports = getCSS;
