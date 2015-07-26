var React = require('react');

var Rider = React.createClass({
  render() {
    let k = this.props.zoom;

    let {
      sled,
      body,
      rightArm,
      leftArm,
      rightLeg,
      leftLeg,
      scarf
    } = this.props.rider.getBodyParts();

    let scarfPart = this.props.rider.scarfConstraints.map((c, i) =>
      <line key={-i}
        x1={c.p.x}
        y1={c.p.y}
        x2={c.q.x}
        y2={c.q.y}
        stroke={ (i % 2) > 0 ? '#D50000' : '#FF8A80'}
        strokeWidth={k * 1.25}
        strokeLinecap='butt'
      />
    );

    let constraints = this.props.rider.constraints.map((c, i) =>
      <line key={i}
        x1={c.p.x}
        y1={c.p.y}
        x2={c.q.x}
        y2={c.q.y}
        stroke={'#CFD8DC'}
        strokeWidth={k * 0.75}
        strokeLinecap='round'
      />
    );

    let bodyParts = [sled, body, rightArm, leftArm, rightLeg, leftLeg];

    let parts = bodyParts.map( (part, i) =>
      <line key={100+i}
        x1={part.x}
        y1={part.y}
        x2={(part.x + 6 * Math.cos(part.angle))}
        y2={(part.y + 6 * Math.sin(part.angle))}
        stroke='#37474F'
        strokeWidth={k * 2}
        strokeLinecap='round'
      />
    );

    let head = (
      <circle
        cx={(body.x + 10 * Math.cos(body.angle))}
        cy={(body.y + 10 * Math.sin(body.angle))}
        r={k * 3}
        fill='#37474F'
      />
    );

    return (
      <g>
        { scarfPart }
        { constraints }
        { parts }
        { head }
      </g>
    );
  }
});

module.exports = Rider;
