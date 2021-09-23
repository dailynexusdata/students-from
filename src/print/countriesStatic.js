/**
 * Map of US States
 *
 * @author alex
 *
 */
import { select } from 'd3-selection';
import { geoPath, geoMercator } from 'd3-geo';
import { min, extent, bin } from 'd3-array';
import { scaleThreshold, scaleLinear } from 'd3-scale';
import { schemeBlues } from 'd3-scale-chromatic';
import { ckmeans } from 'simple-statistics';
import { format } from 'd3-format';

/**
 * @param {*} map - states geojson
 * @author alex
 *
 * @since 9/12/2021
 */
const makePlot = (map, data) => {
  // antartica and border
  map.features.splice(21, 1);
  map.features.splice(6, 1);
  /*
      Container Setup:
    */

  // The class is necessary to apply styling
  const container = select(
    '#where-students-from-countries-map-print-static',
  ).attr('class', 'where-students-from');

  // When the resize event is called, reset the plot
  container.selectAll('*').remove();

  container
    .append('h1')
    .style('color', '#00002B')
    .text(
      '3,969 International Students Came From 107 Countries in the 2020-21 School Year',
    );

  const size = {
    height: 700,
    width: 1000,
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
  // .style('background', '#44A7C477');

  container
    .append('a')
    .style('color', '#00002B')
    .text("Source: UCSB Registrar's 3rd Week Registration Report")
    .attr(
      'href',
      'https://bap.ucsb.edu/institutional-research/registration-reports',
    );

  /*
      Create Scales:
    */
  const proj = geoMercator().fitSize([size.width - 10, size.height], map);

  const projection = geoMercator()
    .scale(proj.scale())
    .translate([proj.translate()[0] + 5, proj.translate()[1] + 20]);

  /*
      Start Plot:
    */

  const countries = svg.selectAll('path').data(map.features).enter();

  const path = geoPath().projection(projection);

  const nBins = 7;
  // console.log(ckmeans(
  //   data.map((d) => +d.y21),
  //   nBins,
  // ).map(d => min(d)));

  const clusters = bin().thresholds([0, 10, 25, 50, 100, 150, 1000])(
    data.map((d) => +d.y21),
  );

  console.log(clusters);
  // const clusters = ckmeans(
  //   data.map((d) => +d.y21),
  //   nBins,
  // );

  const binColor = scaleThreshold()
    .domain(clusters.map((d) => d.x0))
    .range(schemeBlues[nBins + 2]);

  countries
    .append('path')
    .attr('fill', (d) => (d.properties.name === 'United States of America' || d.properties.val === 0
      ? 'none'
      : binColor(d.properties.val)))
    .attr('stroke', '#00002B')
    .attr('stroke-width', 0.5)
    .attr('d', path)
    .on('mouseenter', (_, d) => {
      console.log(d.properties.val, d.properties.name);
    });

  const legendSquareSize = {
    height: 20,
    width: 40,
  };

  const legendX = scaleLinear()
    .domain(extent(binColor.domain()))
    .range([0, legendSquareSize.width * binColor.domain().length]);

  // console.log(legendX.domain(), legendX.range());

  const legendArea = svg
    .append('g')
    .attr(
      'transform',
      `translate(${size.width / 2 + 150}, ${margin.top + 30})`,
    );

  legendArea
    .selectAll('rect')
    .data(binColor.domain())
    .enter()
    .append('rect')
    .attr('x', (d, i) => legendSquareSize.width * i)
    .attr('y', 0)
    .attr('height', legendSquareSize.height)
    .attr('width', legendSquareSize.width)
    .attr('fill', (d) => binColor(d))
    .attr('fill-opacity', 0.97);

  legendArea
    .selectAll('line')
    .data(binColor.domain())
    .enter()
    .append('line')
    .attr('x1', (d, i) => legendSquareSize.width * i)
    .attr('x2', (d, i) => legendSquareSize.width * i)
    .attr('y1', 0)
    .attr('y2', legendSquareSize.height + 10)
    .attr('stroke', '#adadad')
    .attr('stroke-dasharray', '3, 3');

  legendArea
    .selectAll('g')
    .data(clusters)
    .enter()
    .append('g')
    .attr('transform', (d, i) => `translate(${legendSquareSize.width * i}, 0)`)
    .selectAll('rcircs')
    .data((d, i) => d.map((b) => ({ val: b, j: i })))
    .enter()
    .filter((d) => d.val > 0)
    .append('circle')
    .attr('fill', '#00002B')
    .attr('r', 0.75)
    .attr('cx', (d, i) => {
      // console.log(d, clusters);
      const w = legendSquareSize.width;
      const s =
        d.j === binColor.domain().length
          ? clusters[d.j - 1].x1 - 0.5
          : clusters[d.j].x0;
      const e = clusters[d.j].x1;
      // console.log(d, s, e);
      return (w * (d.val - s)) / (e - s);
    })
    .attr('cy', () => (Math.random() * 0.8 + 0.1) * legendSquareSize.height);

  legendArea
    .selectAll('text')
    .data(binColor.domain())
    .enter()
    .append('text')
    .attr('x', (d, i) => legendSquareSize.width * i - 1)
    .attr('y', legendSquareSize.height + 17)
    .attr('alignment-baseline', 'hanging')
    .attr('fill', '#adadad')
    .text(
      (d, i) => format(',')(d)
        + (i === binColor.domain().length - 1 ? ' students →' : ''),
    )
    .attr('font-size', '10pt');

  legendArea
    .append('text')
    .attr('y', -5)
    .attr('fill', '#00002B')
    .text('# students by country');
};

export default makePlot;
