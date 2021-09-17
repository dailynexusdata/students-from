/**
 * Plot of number of students from county divided by county population
 */
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { max } from 'd3-array';

const makePlot = (data) => {
  /*
    Container Setup:
  */

  // The class is necessary to apply styling
  const container = select('#where-students-from-counties-pop-ts').attr(
    'class',
    'where-students-from',
  );

  // When the resize event is called, reset the plot
  container.selectAll('*').remove();

  container.append('h1').text('My title');

  const size = {
    height: 400,
    width: Math.min(600, window.innerWidth - 40),
  };

  const margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  };

  const svg = container
    .append('svg')
    .attr('height', size.height)
    .attr('width', size.width);

  container.append('a').text('Source: __________').attr('href', '');

  /*
    Create Scales:
  */

  const x = scaleLinear()
    .domain([0, 1]) // need to change
    .range([margin.left, size.width - margin.right]);

  const y = scaleLinear()
    .domain([0, max(data, (d) => max(d.values))])
    .range([size.height - margin.bottom, margin.top]);

  /*
    Start Plot:
  */

  svg.selectAll('timeseriesPlot').data(data).enter().append('path');
  // this is how we call the line:
  // .attr('d', (d) => countiesLine(d.values));
};

export default makePlot;
