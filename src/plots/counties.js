/**
 * Map of US States
 *
 * @author alex
 *
 */
import { select, pointer } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { geoPath, geoAlbersUsa } from 'd3-geo';
import { polygonContains } from 'd3-polygon';
import { extent } from 'd3-array';
import { format } from 'd3-format';

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

  container
    .append('h1')
    .text(
      'Los Angeles County Had the Most UCSB Students out of Counties in California for the 2020-21 School Year',
    );

  const size = {
    height: 700,
    width: Math.min(window.innerWidth - 40, 600),
  };

  const margin = {
    top: 110,
    right: 10,
    bottom: 10,
    left: 100,
  };

  // container.style('width', `${size.width}px`);

  const hoverArea = container
    .append('div')
    .style('position', 'relative')
    .style('display', 'flex')
    .style('justify-content', 'center');

  const svg = hoverArea
    .append('svg')
    .attr('height', size.height)
    .attr('width', size.width);

  const sourceContainer = container
    .append('p')
    .style('display', 'inline-block')
    .style('overflow-wrap', 'break-word')
    .style('word-break', 'break-word')
    .style('word-break', 'normal')
    .style('line-height', 'normal')
    .text('Source: ');

  sourceContainer
    .append('span')
    .style('word-wrap', 'normal')
    .style('display', 'inline')
    .style('word-break', 'break-word')
    .style('overflow-wrap', 'break-word')
    .append('a')
    .style('word-wrap', 'normal')
    .style('display', 'inline')
    .style('word-break', 'break-word')
    .style('overflow-wrap', 'break-word')
    .text("UCSB Registrar's 3rd Week Registration Report")
    .attr(
      'href',
      'https://bap.ucsb.edu/institutional-research/registration-reports',
    );
  sourceContainer.append('p').style('display', 'inline-block').text(', ');
  sourceContainer
    .append('span')
    .style('word-wrap', 'normal')
    .style('word-break', 'break-word')
    .style('display', 'inline')
    .style('overflow-wrap', 'break-word')
    .append('a')
    .style('word-wrap', 'normal')
    .style('display', 'inline')
    .style('word-break', 'break-word')
    .style('overflow-wrap', 'break-word')
    .text(' US Census 2019 population estimates.')
    .attr(
      'href',
      'https://www.census.gov/data/tables/time-series/demo/popest/2010s-counties-total.html',
    );

  /*
     Create Scales:
   */
  const proj = geoAlbersUsa().fitSize(
    [
      size.width - margin.left - margin.right,
      size.height - margin.bottom - margin.top,
    ],
    map,
  );

  const projection = geoAlbersUsa()
    .scale(proj.scale())
    .translate([
      proj.translate()[0] + margin.right / 2 + margin.left,
      proj.translate()[1] + margin.top,
    ]);

  const path = geoPath().projection(projection);

  /*
     Start Plot:
   */

  const counties = svg
    .append('g')
    .selectAll('path')
    .data(map.features)
    .enter()
    .append('g');

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

  // console.log(
  //   JSON.stringify(
  //     map.features.map((d) => {
  //       const poly =
  //         d.geometry.coordinates[0][0].length === 2
  //           ? d.geometry.coordinates[0]
  //           : d.geometry.coordinates[0][0];

  //       const output = makeDots(
  //         poly.map(projection),
  //         Math.floor(d.properties.val / 30),
  //         {
  //           distance: 3,
  //           edgeDistance: 1.3,
  //         },
  //       );

  //       return {
  //         ...d,
  //       };
  //     }),
  //   ),
  // );

  setTimeout(() => {
    const circles = svg.append('g');

    circles
      .selectAll('circleGroups')
      .data(map.features.filter((d) => d.properties.val >= 30))
      .enter()
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

    // circles;
    circles.lower();
  }, 0);

  /**
   * SB County label
   */
  const labels = svg.append('g');

  const sbProj = projection([-120.4492794379486, 34.4470229495366]);

  labels.attr('transform', `translate(${sbProj[0] - 200}, ${sbProj[1] - 445})`);

  // 34.44702294953664, -120.4492794379486

  labels
    .append('text')
    .text('Santa Barbara County')
    .attr('fill', '#08519C')
    .attr('font-weight', 'bold')
    .attr('font-size', '10pt')
    .attr('x', 50)
    .attr('y', 410);

  labels
    .append('text')
    .text('had the most students')
    .attr('fill', '#08519C')
    .attr('font-weight', 'bold')
    .attr('font-size', '10pt')
    .attr('x', 50)
    .attr('y', 422);
  labels
    .append('text')
    .text('per county population.')
    .attr('fill', '#08519C')
    .attr('font-weight', 'bold')
    .attr('font-size', '10pt')
    .attr('x', 50)
    .attr('y', 434);

  labels
    .append('svg:defs')
    .append('svg:marker')
    .attr('id', 'where-students-from-county-triangle2')
    .attr('refX', 4)
    .attr('refY', 2)
    .attr('markerWidth', 4)
    .attr('markerHeight', 4)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M 4 0 0 2 4 4')
    .attr('fill', '#08519C');

  labels
    .append('path')
    .attr('d', 'M 185 450 Q 155 465, 140 440')
    .attr('stroke', '#08519C')
    .attr('fill', 'none')
    .attr('stroke-width', 2)
    .attr('marker-start', 'url(#where-students-from-county-triangle2)');
  /**
   *
   * LA Label
   */

  const labelsLa = svg.append('g');

  const laProj = projection([-118.41386577742108, 33.85126781586691]);

  labelsLa.attr(
    'transform',
    `translate(${laProj[0] - 285}, ${laProj[1] - 505})`,
  );

  // 34.44702294953664, -120.4492794379486

  console.log(laProj);

  labelsLa
    .append('path')
    .attr('d', 'M 272 508 Q 255 530, 230 540')
    .attr('fill', 'none')
    .attr('stroke', '#08519C')
    .attr('stroke-width', 2)
    .attr('marker-start', 'url(#where-students-from-county-triangle2)');

  labelsLa
    .append('text')
    .text('Los Angeles County')
    .attr('fill', '#08519C')
    .attr('font-weight', 'bold')
    .attr('font-size', '10pt')
    .attr('x', 80)
    .attr('y', 535);

  labelsLa
    .append('text')
    .text('had the most students')
    .attr('fill', '#08519C')
    .attr('font-weight', 'bold')
    .attr('font-size', '10pt')
    .attr('x', 80)
    .attr('y', 547);
  labelsLa
    .append('text')
    .text('in total.')
    .attr('fill', '#08519C')
    .attr('font-weight', 'bold')
    .attr('font-size', '10pt')
    .attr('x', 80)
    .attr('y', 559);

  /**
   * legend
   */

  const boxLegend = svg
    .append('g')
    .attr('transform', `translate(${size.width / 5}, 5)`);

  boxLegend
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('height', 20)
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('width', 20);

  boxLegend
    .append('circle')
    .attr('cx', 10)
    .attr('cy', 10)
    .attr('r', 2)
    .attr('fill', '#08519C');

  boxLegend
    .append('text')
    .text('Each circle represents')
    .attr('x', 30)
    .attr('y', 12);

  boxLegend.append('text').text('30 students.').attr('x', 30).attr('y', 30);

  const radLegend = svg
    .append('g')
    .attr(
      'transform',
      `translate(${(size.width / 5) * (size.width + 40 < 527 ? 1 : 3)}, ${
        size.width > 487 ? 60 : 105
      })`,
    );

  radLegend
    .selectAll('circle')
    .data([0.001, 0.002])
    .enter()
    .append('circle')
    .attr('cx', 10)
    .attr('cy', (_, i) => i * 20)
    .attr('r', (d) => radius(d))
    .attr('fill', '#08519C');

  radLegend
    .selectAll('text')
    .data([0.001, 0.002])
    .enter()
    .append('text')
    .text((d, i) => `${d * 100}%${i === 0 ? ' of county population' : ''}`)
    .attr('alignment-baseline', 'middle')
    .attr('x', 20)
    .attr('y', (_, i) => i * 20);

  radLegend.append('text').attr('y', -44).text('Circle size shows the');

  radLegend.append('text').attr('y', -30).text('total # of students');

  radLegend.append('text').attr('y', -16).text('per county population.');

  /**
   * hover over:
   */

  const tooltip = hoverArea
    .append('div')
    .style('display', 'none')
    .style('pointer-events', 'none')
    .style('position', 'absolute')
    .style('background-color', 'white')
    .style('padding', '10px')
    .style('border-radius', '10px')
    .style('border', '1px solid #d3d3d3');

  svg
    .append('g')
    .selectAll('overLayPath')
    .data(map.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('id', (d) => `laby-where-students-from-county-${d.properties.name}`)
    .attr('fill-opacity', 0)
    // .attr('fill', 'black')
    .on('mouseenter', (_, d) => {
      tooltip.style('display', 'block');
      tooltip.selectAll('*').remove();
      tooltip.append('h3').text(`${d.properties.name} County`);
      tooltip
        .append('hr')
        .style('margin', '3px 0')
        .style('border', 'none')
        .style('border-top', '1px solid #d3d3d3');
      tooltip
        .append('p')
        .text(`# Students in 2020-21: ${format(',')(d.properties.val)}`);
      // tooltip.append('p').text(`Rank: ${d.properties.rank}`);
    })
    .on('mousemove', (event, d) => {
      select(
        `#laby-where-students-from-county-${d.properties.name.replace(
          / /g,
          '-',
        )}`,
      ).attr('stroke-width', 1.5);

      const width = 200;
      const [mouseX, mouseY] = pointer(event);

      tooltip
        .style('width', `${width}px`)
        .style('left', `${Math.min(mouseX, size.width - width - 30)}px`)
        .style('top', `${mouseY + 10}px`);
    })
    .on('mouseleave', (event, d) => {
      select(
        `#laby-where-students-from-county-${d.properties.name.replace(
          / /g,
          '-',
        )}`,
      ).attr('stroke-width', 0.75);
      tooltip.style('display', 'none');
    });
};

export default makePlot;
