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

import makeStateTimeseries from './states_ts';

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

  container.append('h1').text('My title');

  const size = {
    height: 600,
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

  const states = svg.selectAll('path').data(map.features).enter();

  /*
    Map:

   */

  states
    .append('path')
    .attr('d', path)
    .attr('fill', 'none')
    .attr('stroke', 'black')
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
    .attr('stroke', '#6BAED6')
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
  const tooltip = hoverArea
    .append('div')
    .style('display', 'none')
    .style('pointer-events', 'none')
    .style('position', 'absolute')
    .style('background-color', 'white')
    .style('padding', '10px')
    .style('border-radius', '10px')
    .style('border', '1px solid #d3d3d3');

  const overlay = states
    .append('path')
    .attr('d', path)
    .attr('fill-opacity', 0)
    .on('mouseenter', (_, d) => {
      tooltip.style('display', 'block');
      tooltip.selectAll('*').remove();
      tooltip.append('h3').text(d.properties.NAME);
      tooltip
        .append('hr')
        .style('margin', '3px 0')
        .style('border', 'none')
        .style('border-top', '1px solid #d3d3d3');
      tooltip
        .append('p')
        .text(`# Students 2020-21: ${format(',')(d.properties.val)}`);
      tooltip.append('p').text(`Rank: ${d.properties.rank}`);

      const ts = tooltip.append('div');

      makeStateTimeseries(ts, d.properties.values);
    })
    .on('mousemove', (event, d) => {
      select(
        `#laby-where-students-from-state-${d.properties.NAME.replace(
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
        `#laby-where-students-from-state-${d.properties.NAME.replace(
          / /g,
          '-',
        )}`,
      ).attr('stroke-width', 0.75);
      tooltip.style('display', 'none');
    });
};

export default makePlot;
