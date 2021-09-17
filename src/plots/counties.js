/**
 * Map of US States
 *
 * @author alex
 *
 */
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { geoPath, geoAlbersUsa } from 'd3-geo';
import { polygonContains } from 'd3-polygon';
import { extent } from 'd3-array';

function distPointEdge(p, l1, l2) {
  const A = p[0] - l1[0];
  const B = p[1] - l1[1];
  const C = l2[0] - l1[0];
  const D = l2[1] - l1[1];

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;

  // alpha is proportion of closest point on the line between l1 and l2
  let alpha = -1;
  if (len_sq != 0) {
    // in case of 0 length line
    alpha = dot / len_sq;
  }

  // points on edge closest to p
  let X;
  let Y;

  if (alpha < 0) {
    X = l1[0];
    Y = l1[1];
  }
  else if (alpha > 1) {
    X = l2[0];
    Y = l2[1];
  }
  else {
    X = l1[0] + alpha * C;
    Y = l1[1] + alpha * D;
  }

  const dx = p[0] - X;
  const dy = p[1] - Y;

  return Math.sqrt(dx * dx + dy * dy);
}

/*
Generate points at random locations inside polygon.
    polygon: polygon (Array of points [x,y])
    numPoints: number of points to generate

Returns an Array of points [x,y].

The returned Array will have a property complete, which is set to false if the
desired number of points could not be generated within `options.numIterations` attempts
*/
function makeDots(polygon, numPoints, options) {
  options = {
    // DEFAULT OPTIONS:
    maxIterations: numPoints * 50,
    distance: null, // by default: MIN(width, height) / numPoints / 4,
    edgeDistance: options.distance,
    ...options,
  };

  numPoints = Math.floor(numPoints);

  // calculate bounding box

  let xMin = Infinity;
  let yMin = Infinity;
  let xMax = -Infinity;
  let yMax = -Infinity;

  // console.log({ polygon });

  polygon.forEach((p) => {
    if (p[0] < xMin) {
      // eslint-disable-next-line prefer-destructuring
      xMin = p[0];
    }
    if (p[0] > xMax) {
      // eslint-disable-next-line prefer-destructuring
      xMax = p[0];
    }
    if (p[1] < yMin) {
      // eslint-disable-next-line prefer-destructuring
      yMin = p[1];
    }
    if (p[1] > yMax) {
      // eslint-disable-next-line prefer-destructuring
      yMax = p[1];
    }
  });

  const width = xMax - xMin;
  const height = yMax - yMin;

  // default options depending on bounds

  options.distance =
    options.distance || Math.min(width, height) / numPoints / 4;
  options.edgeDistance = options.edgeDistance || options.distance;

  // generate points

  const points = [];
  // console.log('HERE');
  // console.log(options, numPoints);

  // console.log(polygon);

  let i = 0;
  while (points.length !== numPoints && i < options.maxIterations * numPoints) {
    const p = [xMin + Math.random() * width, yMin + Math.random() * height];

    let keep = false;
    if (polygonContains(polygon, p)) {
      keep = true;
      for (let j = 0; j < polygon.length - 1 && keep; j++) {
        if (
          distPointEdge(p, polygon[j], polygon[j + 1]) < options.edgeDistance
        ) {
          keep = false;
        }
      }
      for (let j = 0; j < points.length && keep; j++) {
        const dx = p[0] - points[j][0];
        const dy = p[1] - points[j][1];

        if (Math.sqrt(dx * dx + dy * dy) < options.distance) {
          keep = false;
        }
      }
    }

    if (keep) {
      points.push(p);
    }
    ++i;
  }

  // console.log(numPoints, points.length);
  // points.complete = points.length >= numPoints;
  // console.log({ points });
  return points;
}
/**
 * @param {*} map - states geojson
 * @author alex
 *
 * @since 9/12/2021
 */
const makePlot = (map) => {
  /*
     Container Setup:
   */

  // The class is necessary to apply styling
  const container = select('#where-students-from-counties-map').attr(
    'class',
    'where-students-from',
  );

  // When the resize event is called, reset the plot
  container.selectAll('*').remove();

  container.append('h1').text('My title');

  const size = {
    height: 600,
    width: Math.min(window.innerWidth - 40, 600),
  };

  const margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  };

  container.style('width', `${size.width}px`);

  const svg = container
    .append('svg')
    .attr('height', size.height)
    .attr('width', size.width);

  container.append('a').text('Source: __________').attr('href', '');

  /*
     Create Scales:
   */
  const proj = geoAlbersUsa().fitSize([size.width - 10, size.height], map);

  const projection = geoAlbersUsa()
    .scale(proj.scale())
    .translate([proj.translate()[0] + 5, proj.translate()[1]]);

  const path = geoPath().projection(projection);

  /*
     Start Plot:
   */

  const counties = svg.selectAll('path').data(map.features).join('g');

  counties
    .append('path')
    .attr('d', path)
    // .attr('fill', '#d3d3d322')
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', 0.5);

  const radius = scaleLinear()
    .domain(extent(map.features, (d) => d.properties.pct))
    .range([0.6, 3.5]);

  setTimeout(() => {
    counties
      .append('g')
      .selectAll('circle')
      .data((d, i) => {
        const poly =
          d.geometry.coordinates[0][0].length === 2
            ? d.geometry.coordinates[0]
            : d.geometry.coordinates[0][0];

        const output = makeDots(
          poly.map(projection),
          Math.floor(d.properties.val / 30),
          {
            distance: 3,
            edgeDistance: 1.3,
          },
        );

        return output.map((o) => {
          o.properties = { ...d.properties };
          return o;
        });
      })
      .enter()
      .append('circle')
      .attr('cx', (d) => d[0])
      .attr('cy', (d) => d[1])
      .attr('r', (d) => radius(d.properties.pct))
      .attr('fill', '#08519C')
      .attr('stroke', 'white')
      .attr('stroke-width', 0.1);
  }, 0);
};

export default makePlot;
