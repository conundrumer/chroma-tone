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
    } = this.props.rider.bodyParts;

    let scarfPart = this.props.rider.scarfConstraints.map((c, i) =>
      <line key={-i}
        x1={k * c.p.x}
        y1={k * c.p.y}
        x2={k * c.q.x}
        y2={k * c.q.y}
        stroke={ (i % 2) > 0 ? '#D50000' : '#FF8A80'}
        strokeWidth={k * 1.25}
        strokeLinecap='butt'
      />
    );

    let constraints = this.props.rider.constraints.map((c, i) =>
      <line key={i}
        x1={k * c.p.x}
        y1={k * c.p.y}
        x2={k * c.q.x}
        y2={k * c.q.y}
        stroke={'#CFD8DC'}
        strokeWidth={k * 0.75}
        strokeLinecap='round'
      />
    );

    let bodyParts = [sled, body, rightArm, leftArm, rightLeg, leftLeg];

    let parts = bodyParts.map( (part, i) =>
      <line key={100+i}
        x1={k * part.x}
        y1={k * part.y}
        x2={k * (part.x + 6 * Math.cos(part.angle))}
        y2={k * (part.y + 6 * Math.sin(part.angle))}
        stroke='#37474F'
        strokeWidth={k * 2}
        strokeLinecap='round'
      />
    );

    let head = (
      <circle
        cx={k * (body.x + 10 * Math.cos(body.angle))}
        cy={k * (body.y + 10 * Math.sin(body.angle))}
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
