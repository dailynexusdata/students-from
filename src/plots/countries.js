/**
 * Map of US States
 *
 * @author alex
 *
 */
import { select } from 'd3-selection';
import { scaleLinear, scaleThreshold } from 'd3-scale';
import { geoPath, geoOrthographic } from 'd3-geo';
import { timer } from 'd3-timer';
import { min } from 'd3-array';

import { schemeBlues } from 'd3-scale-chromatic';
import { ckmeans } from 'simple-statistics';

/**
 * @param {*} map - states geojson
 * @author alex
 *
 * @since 9/12/2021
 */
const makePlot = (map, data) => {
  map.features[21].properties.val = -1;
  /*
     Container Setup:
   */

  // The class is necessary to apply styling
  const container = select('#where-students-from-countries-map').attr(
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
  const proj = geoOrthographic().fitSize([size.width - 10, size.height], map);

  const projection = geoOrthographic()
    .scale(proj.scale())
    .translate([proj.translate()[0] + 5, proj.translate()[1]])
    .rotate([90, 340, 0]);

  /*
     Start Plot:
   */
  const nBins = 7;
  const binColor = scaleThreshold()
    .domain(
      ckmeans(
        data.map((d) => +d.y21),
        nBins,
      ).map((d) => min(d)),
    )
    .range(schemeBlues[nBins + 2]);

  const states = svg
    .selectAll('path')
    .data(map.features)
    .enter()
    .append('path')
    // .attr('fill', 'none')
    .attr('fill', (d) => (d.properties.name === 'United States of America'
      || d.properties.val === -1
      ? 'none'
      : binColor(d.properties.val)))
    .attr('stroke', 'black')
    .attr('stroke-width', 0.5)
    .attr('d', geoPath().projection(projection));

  //   let i = 1;
  //   setInterval(() => {
  //     if (i === 360) {
  //       i = 0;
  //     }
  //     states.attr('d', geoPath().projection(projection.rotate([90 + i, 340, 0])));
  //     i += 0.25;
  //   }, 50);

  const rotater = timer((elapsed) => {
    const elapsedTime = (0.01 * elapsed) % 360;
    states.attr(
      'd',
      geoPath().projection(projection.rotate([90 + elapsedTime, 340, 0])),
    );
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      //   rotater.restart();
    }
    else {
      //   rotater.stop();
    }
  });
};

export default makePlot;
