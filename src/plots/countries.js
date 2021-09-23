/**
 * Map of US States
 *
 * @author alex
 *
 */
import { select, pointer } from 'd3-selection';
import { scaleThreshold } from 'd3-scale';
import { geoPath, geoOrthographic } from 'd3-geo';
import { timer } from 'd3-timer';
import { min, bin } from 'd3-array';
import { format } from 'd3-format';

import { schemeBlues } from 'd3-scale-chromatic';
// import { ckmeans } from 'simple-statistics';

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
  container
    .append('h1')
    .style('color', '#00002B')
    .text(
      '3,969 International Students Came From 107 Countries in the 2020-21 School Year',
    );

  const inputArea = container
    .append('div')
    .style('width', '100%')
    .style('display', 'flex')
    .style('flex-direction', 'row');
  // .style('display', 'inline');

  const size = {
    height: 500,
    width: Math.min(600, window.innerWidth - 40),
  };

  const margin = {
    top: 35,
    right: 10,
    bottom: 85,
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
  const proj = geoOrthographic().fitSize(
    [size.width - 10, size.height - margin.top - margin.bottom],
    map,
  );

  const projection = geoOrthographic()
    .scale(proj.scale())
    .translate([proj.translate()[0] + 5, proj.translate()[1] + margin.top])
    .rotate([90, 340, 0]);

  /*
     Start Plot:
   */
  const nBins = 7;
  // console.log(ckmeans(
  //   data.map((d) => +d.y21),
  //   nBins,
  // ).map(d => min(d)));

  const clusters = bin().thresholds([0, 10, 25, 50, 100, 150, 1000])(
    data.map((d) => +d.y21),
  );

  // console.log(clusters);
  // const clusters = ckmeans(
  //   data.map((d) => +d.y21),
  //   nBins,
  // );

  const binColor = scaleThreshold()
    .domain(clusters.map((d) => d.x0))
    .range(schemeBlues[nBins + 2]);

  const states = svg
    .selectAll('path')
    .data(map.features)
    .enter()
    .append('path')
    // .attr('fill', 'none')
    .attr('fill', (d) => (d.properties.name === 'United States of America' || d.properties.val <= 0
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

  let rotater = timer((elapsed) => {
    const elapsedTime = (0.01 * elapsed) % 360;
    states.attr(
      'd',
      geoPath().projection(projection.rotate([45 + elapsedTime, 340, 0])),
    );
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      rotater.stop();
      rotater = timer((elapsed) => {
        const elapsedTime = (0.01 * elapsed) % 360;
        states.attr(
          'd',
          geoPath().projection(projection.rotate([45 + elapsedTime, 340, 0])),
        );
      });
    }
    else {
      rotater.stop();
    }
  });

  /**
   * Legend
   */
  const legendSquareSize = {
    height: 10 * (size.width > 400 ? 2 : 1),
    width: 20 * (size.width > 400 ? 2 : 1),
  };

  const legendArea = svg
    .append('g')
    .attr(
      'transform',
      `translate(${size.width - (size.width > 400 ? 350 : 250)}, ${
        size.height - margin.bottom + 30
      })`,
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
    .attr('y', legendSquareSize.height + 10)
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

  /**
   * tooltip:
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

  states
    .on('mouseenter', (_, d) => {
      tooltip.style('display', 'block');
      tooltip.selectAll('*').remove();
      tooltip.append('h3').text(d.properties.name);
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

  inputArea.append('p').text('Rotate globe:').style('display', 'block');
  inputArea
    .append('input')
    .style('display', 'block')
    .attr('type', 'range')
    .attr('min', 0)
    .attr('value', 0)
    .attr('max', 360)
    .on('input', (event) => {
      const deg = event.target.value;
      rotater.stop();
      states.attr('d', geoPath().projection(projection.rotate([deg, 340, 0])));
    });
};

export default makePlot;
