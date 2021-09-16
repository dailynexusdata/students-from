/**
 * Map of US States
 *
 * @author alex
 *
 */
import { select } from 'd3-selection';
import { geoPath, geoMercator } from 'd3-geo';
import { min } from 'd3-array';
import { scaleThreshold } from 'd3-scale';
import { schemeBlues } from 'd3-scale-chromatic';
import { ckmeans } from 'simple-statistics';

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

  container.append('h1').text('My title');

  const size = {
    height: 800,
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

  container.append('a').text('Source: __________').attr('href', '');

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

  const nBins = 5;
  const binColor = scaleThreshold()
    .domain(
      ckmeans(
        data.map((d) => +d.y21),
        nBins,
      ).map((d) => min(d)),
    )
    .range(schemeBlues[nBins]);

  console.log(binColor.domain(), binColor.range());

  countries
    .append('path')
    .attr('fill', (d) => binColor(d.properties.val))
    .attr('stroke', 'black')
    .attr('d', path);
};

export default makePlot;
