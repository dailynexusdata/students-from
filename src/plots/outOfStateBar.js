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

const stateNames = [
  {
    name: 'Alabama',
    abbreviation: 'AL',
  },
  {
    name: 'Alaska',
    abbreviation: 'AK',
  },
  {
    name: 'American Samoa',
    abbreviation: 'AS',
  },
  {
    name: 'Arizona',
    abbreviation: 'AZ',
  },
  {
    name: 'Arkansas',
    abbreviation: 'AR',
  },
  {
    name: 'California',
    abbreviation: 'CA',
  },
  {
    name: 'Colorado',
    abbreviation: 'CO',
  },
  {
    name: 'Connecticut',
    abbreviation: 'CT',
  },
  {
    name: 'Delaware',
    abbreviation: 'DE',
  },
  {
    name: 'District of Columbia',
    abbreviation: 'DC',
  },
  {
    name: 'Federated States Of Micronesia',
    abbreviation: 'FM',
  },
  {
    name: 'Florida',
    abbreviation: 'FL',
  },
  {
    name: 'Georgia',
    abbreviation: 'GA',
  },
  {
    name: 'Guam',
    abbreviation: 'GU',
  },
  {
    name: 'Hawaii',
    abbreviation: 'HI',
  },
  {
    name: 'Idaho',
    abbreviation: 'ID',
  },
  {
    name: 'Illinois',
    abbreviation: 'IL',
  },
  {
    name: 'Indiana',
    abbreviation: 'IN',
  },
  {
    name: 'Iowa',
    abbreviation: 'IA',
  },
  {
    name: 'Kansas',
    abbreviation: 'KS',
  },
  {
    name: 'Kentucky',
    abbreviation: 'KY',
  },
  {
    name: 'Louisiana',
    abbreviation: 'LA',
  },
  {
    name: 'Maine',
    abbreviation: 'ME',
  },
  {
    name: 'Marshall Islands',
    abbreviation: 'MH',
  },
  {
    name: 'Maryland',
    abbreviation: 'MD',
  },
  {
    name: 'Massachusetts',
    abbreviation: 'MA',
  },
  {
    name: 'Michigan',
    abbreviation: 'MI',
  },
  {
    name: 'Minnesota',
    abbreviation: 'MN',
  },
  {
    name: 'Mississippi',
    abbreviation: 'MS',
  },
  {
    name: 'Missouri',
    abbreviation: 'MO',
  },
  {
    name: 'Montana',
    abbreviation: 'MT',
  },
  {
    name: 'Nebraska',
    abbreviation: 'NE',
  },
  {
    name: 'Nevada',
    abbreviation: 'NV',
  },
  {
    name: 'New Hampshire',
    abbreviation: 'NH',
  },
  {
    name: 'New Jersey',
    abbreviation: 'NJ',
  },
  {
    name: 'New Mexico',
    abbreviation: 'NM',
  },
  {
    name: 'New York',
    abbreviation: 'NY',
  },
  {
    name: 'North Carolina',
    abbreviation: 'NC',
  },
  {
    name: 'North Dakota',
    abbreviation: 'ND',
  },
  {
    name: 'Northern Mariana Islands',
    abbreviation: 'MP',
  },
  {
    name: 'Ohio',
    abbreviation: 'OH',
  },
  {
    name: 'Oklahoma',
    abbreviation: 'OK',
  },
  {
    name: 'Oregon',
    abbreviation: 'OR',
  },
  {
    name: 'Palau',
    abbreviation: 'PW',
  },
  {
    name: 'Pennsylvania',
    abbreviation: 'PA',
  },
  {
    name: 'Puerto Rico',
    abbreviation: 'PR',
  },
  {
    name: 'Rhode Island',
    abbreviation: 'RI',
  },
  {
    name: 'South Carolina',
    abbreviation: 'SC',
  },
  {
    name: 'South Dakota',
    abbreviation: 'SD',
  },
  {
    name: 'Tennessee',
    abbreviation: 'TN',
  },
  {
    name: 'Texas',
    abbreviation: 'TX',
  },
  {
    name: 'Utah',
    abbreviation: 'UT',
  },
  {
    name: 'Vermont',
    abbreviation: 'VT',
  },
  {
    name: 'Virgin Islands',
    abbreviation: 'VI',
  },
  {
    name: 'Virginia',
    abbreviation: 'VA',
  },
  {
    name: 'Washington',
    abbreviation: 'WA',
  },
  {
    name: 'West Virginia',
    abbreviation: 'WV',
  },
  {
    name: 'Wisconsin',
    abbreviation: 'WI',
  },
  {
    name: 'Wyoming',
    abbreviation: 'WY',
  },
];

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

  const innerRadius = 80;
  const outerRadius = size.width * 0.42;

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
    .attr('fill-opacity', 0.5)
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
    .on('mouseenter', function (event, dat) {
      console.log(dat.properties);
      select(this)
        .attr(
          'd',
          arc()
            .innerRadius(innerRadius - 5)
            .outerRadius((d) => y(d.properties.val) + 5)
            .startAngle((d) => x(d.properties.NAME))
            .endAngle((d) => x(d.properties.NAME) + x.bandwidth())
            .padAngle(0.01)
            .padRadius(innerRadius - 5),
        )
        .attr('fill-opacity', 1);
    })
    .on('mouseleave', function (event, dat) {
      select(this)
        .attr(
          'd',
          arc()
            .innerRadius(innerRadius)
            .outerRadius((d) => y(d.properties.val))
            .startAngle((d) => x(d.properties.NAME))
            .endAngle((d) => x(d.properties.NAME) + x.bandwidth())
            .padAngle(0.01)
            .padRadius(innerRadius - 5),
        )
        .attr('fill-opacity', 0.5);
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
    .text(
      (d) => stateNames.find((n) => n.name === d.properties.NAME).abbreviation,
    )
    .attr('transform', (d) => ((x(d.properties.NAME) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI)
      < Math.PI
      ? 'rotate(180)'
      : 'rotate(0)'))
    .style('font-size', '10pt')
    .attr('alignment-baseline', 'middle');
};

export default makePlot;
