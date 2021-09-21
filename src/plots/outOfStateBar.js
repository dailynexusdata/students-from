/**
 * circular bar chart
 *
 * @author alex
 *
 */
import { select } from 'd3-selection';
import { scaleBand, scaleRadial } from 'd3-scale';
import { max } from 'd3-array';
import { arc } from 'd3-shape';

/**
 *
 * @author alex
 *
 * @since 9/20/2021
 */
const makePlot = (data) => {
  /*
    Container Setup:
  */
  // The class is necessary to apply styling
  const container = select('#where-students-from-out-of-state-bar').attr(
    'class',
    'where-students-from',
  );

  // When the resize event is called, reset the plot
  container.selectAll('*').remove();

  container.append('h1').text('My title');

  const size = {
    height: 600,
    width: Math.min(600, window.innerWidth - 40),
  };

  const margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  };

  const innerRadius = 100;
  const outerRadius = size.width / 2;

  const svg = container
    .append('svg')
    .attr('height', size.height)
    .attr('width', size.width)
    .append('g')
    .attr(
      'transform',
      `translate(${
        (size.width - margin.left - margin.right) / 2 + margin.left
      }, ${(size.height - margin.top - margin.bottom) / 2 + margin.top})`,
    );

  container.append('a').text('Source: __________').attr('href', '');

  /*
    Create Scales:
  */

  const x = scaleBand()
    .domain(data.features.map((d) => d.properties.NAME))
    .range([0, 2 * Math.PI]);

  const y = scaleRadial()
    .domain([0, max(data.features, (d) => d.properties.val)])
    .range([innerRadius, outerRadius]);

  /*
    Start Plot:
  */
  svg
    .selectAll('path')
    .data(data.features)
    .enter()
    .append('path')
    .attr('fill', '#2171B5')
    .attr(
      'd',
      arc()
        .innerRadius(innerRadius)
        .outerRadius((d) => y(d.properties.val))
        .startAngle((d) => x(d.properties.NAME))
        .endAngle((d) => x(d.properties.NAME) + x.bandwidth())
        .padAngle(0.01)
        .padRadius(innerRadius),
    )
    .on('mouseenter', (event, d) => {
      console.log(d.properties.val);
    });

  svg
    .selectAll('g')
    .data(data.features)
    .enter()
    .append('g')
    .attr('text-anchor', (d) => ((x(d.properties.NAME) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI)
      < Math.PI
      ? 'end'
      : 'start'))
    .attr(
      'transform',
      (d) => `rotate(${
        ((x(d.properties.NAME) + x.bandwidth() / 2) * 180) / Math.PI - 90
      }) translate(${y(d.properties.val) + 5}, 0)`,
    )
    .append('text')
    .text((d) => d.properties.NAME)
    .attr('transform', (d) => ((x(d.properties.NAME) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI)
      < Math.PI
      ? 'rotate(180)'
      : 'rotate(0)'))
    .style('font-size', '10pt')
    .attr('alignment-baseline', 'middle');
};

export default makePlot;
