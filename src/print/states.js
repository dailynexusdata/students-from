/**
 * Map of US States
 *
 * @author alex
 *
 */
import { select, pointer } from 'd3-selection';
import { geoPath, geoAlbersUsa } from 'd3-geo';
import { scaleLinear } from 'd3-scale';
import { extent } from 'd3-array';
import { format } from 'd3-format';

import { arc } from 'd3-shape';

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
  const container = select('#where-students-from-states-map').attr(
    'class',
    'where-students-from',
  );

  // When the resize event is called, reset the plot
  container.selectAll('*').remove();

  container
    .append('h1')
    .text(
      'New York and Washington Tie for Most Out-Of-State Students in the 2020-21 School Year',
    );

  const size = {
    height: 570,
    width: Math.min(800, window.innerWidth - 40),
  };

  const margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  };
  const hoverArea = container
    .append('div')
    .style('position', 'relative')
    .style('display', 'flex')
    .style('justify-content', 'center');

  const svg = hoverArea
    .append('svg')
    .attr('height', size.height)
    .attr('width', size.width);

  container
    .append('a')
    .text("Source: UCSB Registrar's 3rd Week Registration Report")
    .attr(
      'href',
      'https://bap.ucsb.edu/institutional-research/registration-reports',
    );

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

  const states = svg.selectAll('path').data(map.features).enter();

  /*
    Map:

   */

  states
    .append('path')
    .attr('d', path)
    .attr('fill', 'none')
    .attr('stroke', '#00002B')
    .attr('stroke-width', 0.75)
    .attr(
      'id',
      (d) => `laby-where-students-from-state-${d.properties.NAME.replace(
        / /g,
        '-',
      )}`,
    );

  /**
   * Circles:
   */
  const radius = scaleLinear()
    .domain(
      extent(
        map.features.filter((d) => d.properties.NAME !== 'California'),
        (d) => d.properties.val,
      ),
    )
    .range([3, 22]);

  // console.log(radius.domain(), radius.range());

  states
    .append('circle')
    .attr('cx', (d) => path.centroid(d)[0])
    .attr('cy', (d) => path.centroid(d)[1])
    .attr('r', (d) => (d.properties.NAME === 'California' ? 0 : radius(d.properties.val)))
    .attr('fill', '#2171B5')
    .attr('stroke', 'white')
    .attr('stroke-width', 0.8);

  /**
   * Arches:
   */
  const topStates = map.features
    .sort((a, b) => b.properties.val - a.properties.val)
    .filter((d) => d.properties.NAME !== 'California')
    .slice(0, 7);

  const caPoint = projection([-119.84710234009627, 34.412802738774445]);

  const arcWidth = scaleLinear()
    .domain(extent(topStates, (d) => d.properties.val))
    .range([1, 3]);

  const topStatesNames = topStates.map((d) => d.properties.NAME);

  states
    .filter(
      (d) => topStatesNames.includes(d.properties.NAME)
        && d.properties.NAME !== 'California',
    )
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', '#EDC949')
    .attr('stroke-width', (d) => arcWidth(d.properties.val))
    .attr('d', (d) => {
      const start = path.centroid(d);
      const midX = (start[0] + caPoint[0]) / 2;
      const maxY = Math.min(start[1], caPoint[1]);

      const startStr = start.join(' ');
      const endStr = caPoint.join(' ');

      let yOffset = 190;
      let xOffset = 0;
      if (d.properties.NAME === 'Texas') {
        yOffset = 140;
      }
      else if (d.properties.NAME === 'Colorado') {
        yOffset = 90;
      }
      else if (d.properties.NAME === 'Washington') {
        yOffset = 150;
        xOffset = 100;
      }
      else if (d.properties.NAME === 'Oregon') {
        yOffset = 150;
        xOffset = 100;
      }
      else if (d.properties.NAME === 'New Jersey') {
        yOffset = 230;
      }

      const midStr = `${midX - xOffset} ${maxY - yOffset}`;
      return `M ${startStr} Q ${midStr}, ${endStr}`;
    });

  /**
   * Tooltip:
   */

  const cSizes = [10, 100, 200];

  const legendArea = svg
    .append('g')
    .attr(
      'transform',
      `translate(${(size.width * 3) / 5 - 50}, ${margin.top + 16})`,
    );
  // .attr(
  //   'transform',
  //   `translate(${(size.width * 3) / 5}, ${
  //     size.height - margin.bottom - radius(cSizes[cSizes.length - 1]) * 2
  //   })`,
  // );

  legendArea
    .selectAll('circle')
    .data(cSizes)
    .enter()
    .append('circle')
    .attr('fill', 'none')
    // .attr('fill', '#2171B5')
    // .attr('fill-opacity', 1 / 3)
    .attr('cx', radius(cSizes[cSizes.length - 1]))
    .attr('cy', (d) => 2 * radius(cSizes[cSizes.length - 1]) - radius(d))
    .attr('r', (d) => radius(d))
    .attr('stroke', '#2171B5');
  // .attr('stroke', 'black');

  legendArea
    .selectAll('line')
    .data(cSizes)
    .enter()
    .append('line')
    .attr('x1', radius(cSizes[cSizes.length - 1]))
    .attr('x2', radius(cSizes[cSizes.length - 1]) * 2 + 20)
    .attr('y1', (d) => 2 * radius(cSizes[cSizes.length - 1]) - 2 * radius(d))
    .attr('y2', (d) => 2 * radius(cSizes[cSizes.length - 1]) - 2 * radius(d))
    .attr('stroke', 'black')
    .attr('stroke-width', 0.5)
    .attr('stroke-dasharray', '3,3');

  legendArea
    .selectAll('text')
    .data(cSizes)
    .enter()
    .append('text')
    .attr('fill', '#00002B')
    .attr('alignment-baseline', 'middle')
    .attr('x', radius(cSizes[cSizes.length - 1]) * 2 + 20)
    .attr('y', (d) => 2 * radius(cSizes[cSizes.length - 1]) - 2 * radius(d))
    .text((d, i) => d + (i === cSizes.length - 1 ? ' students' : ''));

  legendArea
    .append('text')
    .attr('fill', '#00002B')
    .text('# students 2020-21')
    .attr('y', -14);

  const arcLegendArea = svg
    .append('g')
    .attr('transform', `translate(${(size.width * 3) / 5 + 140}, -1)`);

  arcLegendArea
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', '#EDC949')
    .attr('stroke-width', 2)
    .attr('d', 'M 40 12 Q 60 0, 80 12');
  arcLegendArea
    .append('text')
    .attr('fill', '#00002B')
    .attr('y', 32)
    .text('Indicates a state');
  arcLegendArea
    .append('text')
    .attr('fill', '#00002B')
    .attr('y', 48)
    .text('with top 7 number');
  arcLegendArea
    .append('text')
    .attr('fill', '#00002B')
    .attr('y', 64)
    .text('of students.');
};

export default makePlot;
