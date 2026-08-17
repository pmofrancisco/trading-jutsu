/**
 * The Trading Jutsu mark: a sharingan — three tomoe orbiting a ringed pupil.
 *
 * The geometry lives here as data rather than as markup in two places, because
 * it has two consumers that cannot share a component — `<Mark />` in the
 * headers, and the hand-assembled SVG string that `app/icon.tsx` serves as the
 * favicon. Editing the eye means editing the constants below alone.
 *
 * The numbers are built into a path here rather than checked in as one opaque
 * `d` string: a tomoe is four curves whose control points only make sense
 * relative to the ball they hang off, and nobody can retune a comma by editing
 * twenty-four hand-computed coordinates. The cost is a little trigonometry at
 * module load, once.
 */
export const markViewBox = '0 0 32 32';

/**
 * A fixed hex rather than `currentColor`. The favicon renders outside the
 * document, with no stylesheet and no theme class to inherit from, so it needs
 * a literal colour — and once one consumer has to name the red, the other
 * naming it separately (as a `text-*` class) is just the same value written
 * twice. Red is not negotiable the way the old shuriken's blue was: a sharingan
 * that is not red does not read as a sharingan.
 *
 * This particular red holds its own against both a light and a dark tab strip
 * and clears 3:1 against both page backgrounds, which is the bar for a graphic.
 */
export const markColor = '#dc2626';

type Point = [number, number];

const CENTER = 16;
const IRIS_RADIUS = 15;
/**
 * The ring is punched out and the pupil filled back in, so the eye reads as an
 * eye rather than as a disc with three bites taken out of it. Nested circles,
 * so `fill-rule="evenodd"` alternates them: iris fills, ring holes, pupil
 * fills.
 */
const PUPIL_RING_RADIUS = 5;
const PUPIL_RADIUS = 2.4;

const TOMOE_RADIUS = 2.6;
/** Distance from the eye's centre to each tomoe's ball. */
const TOMOE_ORBIT = 9.6;
const TOMOE_ANGLES = [-90, 30, 150];

/*
 * One tomoe in its own frame: a unit ball at the origin, its tail running out
 * along +x and curling back towards -y. Everything is a multiple of the ball's
 * radius, so the comma keeps its proportions wherever it is placed.
 *
 * The tail must not reach `PUPIL_RING_RADIUS`. Two holes that overlap under
 * `evenodd` flip back to filled, so a tail crossing the ring would paint a red
 * scar through it rather than merging with it.
 */
/** Degrees either side of +x at which the tail leaves the ball. */
const TAIL_ATTACH = 55;
const TAIL_TIP: Point = [2.9, -3.1];
/** Cubic control points, ball to tip along the tail's leading edge. */
const TAIL_OUT: [Point, Point] = [
  [2.1, 1.0],
  [3.2, -1.1],
];
/** And back from the tip to the ball along the trailing edge, which is what
 * tapers the tail to a point. */
const TAIL_BACK: [Point, Point] = [
  [2.4, -2.7],
  [0.9, -1.3],
];

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
/** Two decimals is finer than a 32-unit box can show and keeps the path short. */
const round = (n: number) => Number(n.toFixed(2));

/** A closed circle centred on the eye, as two half arcs. */
function circle(radius: number) {
  const left = CENTER - radius;
  const right = CENTER + radius;

  return (
    `M ${left} ${CENTER} ` +
    `A ${radius} ${radius} 0 1 0 ${right} ${CENTER} ` +
    `A ${radius} ${radius} 0 1 0 ${left} ${CENTER} Z`
  );
}

/**
 * A tomoe placed at `angle` around the eye.
 *
 * The comma is rotated a further quarter turn behind its orbital position, so
 * the tail sweeps tangentially and curls inwards towards the pupil rather than
 * out towards the rim.
 */
function tomoe(angle: number) {
  const spin = toRadians(angle - 90);
  const cos = Math.cos(spin);
  const sin = Math.sin(spin);
  const ballX = CENTER + TOMOE_ORBIT * Math.cos(toRadians(angle));
  const ballY = CENTER + TOMOE_ORBIT * Math.sin(toRadians(angle));

  const at = ([x, y]: Point) => {
    const localX = x * TOMOE_RADIUS;
    const localY = y * TOMOE_RADIUS;

    return [
      round(ballX + localX * cos - localY * sin),
      round(ballY + localX * sin + localY * cos),
    ];
  };

  // The two points where the tail meets the ball. The ball's own outline is the
  // long way round between them, away from the tail.
  const [startX, startY] = at([
    Math.cos(toRadians(-TAIL_ATTACH)),
    Math.sin(toRadians(-TAIL_ATTACH)),
  ]);
  const [baseX, baseY] = at([
    Math.cos(toRadians(TAIL_ATTACH)),
    Math.sin(toRadians(TAIL_ATTACH)),
  ]);
  const [tipX, tipY] = at(TAIL_TIP);
  const [out1, out2] = TAIL_OUT.map(at);
  const [back1, back2] = TAIL_BACK.map(at);

  return (
    `M ${startX} ${startY} ` +
    `A ${TOMOE_RADIUS} ${TOMOE_RADIUS} 0 1 0 ${baseX} ${baseY} ` +
    `C ${out1[0]} ${out1[1]} ${out2[0]} ${out2[1]} ${tipX} ${tipY} ` +
    `C ${back1[0]} ${back1[1]} ${back2[0]} ${back2[1]} ${startX} ${startY} Z`
  );
}

/**
 * Six subpaths — iris, pupil ring, pupil, then the three tomoe. The ring and
 * the tomoe are holes punched by `fill-rule="evenodd"`, so both consumers must
 * set that or the eye fills as a plain disc.
 *
 * Holes rather than a second colour, because the mark is one path with one
 * fill: it inverts against whatever it sits on, which is dark tomoe on a dark
 * tab strip and light tomoe on a light one. The alternative — a second path in
 * a second colour — would have to be threaded through both consumers to buy a
 * distinction neither of them shows at 16px.
 */
export const markPath = [
  circle(IRIS_RADIUS),
  circle(PUPIL_RING_RADIUS),
  circle(PUPIL_RADIUS),
  ...TOMOE_ANGLES.map(tomoe),
].join(' ');

/**
 * Sized by the caller via `className`. The colour is not the caller's to set —
 * see `markColor`.
 */
export default function Mark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={markViewBox}
      fill={markColor}
      fillRule="evenodd"
      xmlns="http://www.w3.org/2000/svg"
      // Decorative: the wordmark beside it already names the app.
      aria-hidden
    >
      <path d={markPath} />
    </svg>
  );
}
