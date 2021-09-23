/**
 * @author alex
 * @since 2021-09-12
 */
import './styles.scss';

import { json, csv } from 'd3-fetch';
import { nest } from 'd3-collection';

// import plot functions here:
// import makePLOT_NAME from "./PLOT_NAME";
// import makeStates from '../print/states';
import makeStates from '../plots/states';
import makeCountries from '../plots/countries';
// import makeCounties from '../print/counties';
import makeCounties from '../plots/counties';
// import makeCountriesStatic from '../print/countriesStatic';
// import makeCountiesTs from '../plots/counties_ts';
// import makeOutOfStateBars from '../plots/outOfStateBar';

(async () => {
  const states = await json('dist/data/states.geojson');
  states.features = states.features.filter(
    (d) => d.properties.NAME !== 'Puerto Rico',
  );
  const statesData = nest()
    .key((d) => d.name)
    .entries(
      await csv('dist/data/statesData.csv', (d) => ({
        ...d,
        val: +d.val,
        year: +d.year,
      })),
    )
    .sort((a, b) => b.values[0].val - a.values[0].val);

  statesData.forEach((d, i) => {
    const prop = states.features.find(
      (c) => c.properties.NAME === d.key,
    ).properties;
    prop.val = d.values[0].val;
    prop.values = d.values;
    prop.rank = i + 1;
  });
  states.features = states.features.sort(
    (a, b) => b.properties.val - a.properties.val,
  );

  const countries = await json('dist/data/countries.geojson');
  const countriesData = await csv('dist/data/countries.csv');

  countries.features = countries.features.map((d) => {
    const dat = countriesData.find((c) => c.Country === d.properties.name);
    const prop = {
      ...d.properties,
      val: dat !== undefined ? +dat.y21 : 0,
    };
    return { ...d, properties: prop };
  });

  const counties = await json('dist/data/counties.geojson');
  // const countiesData = await csv('dist/data/countiesData.csv', (d) => ({
  //   ...d,
  //   val: +d.val,
  // }));

  // nest()
  //   .key((d) => d.county)
  //   .entries(countiesData.filter((d) => d.key === 'v21' || d.key === 'p19'))
  //   .forEach((d) => {
  //     const prop = counties.features.find(
  //       (c) => c.properties.name === d.key,
  //     ).properties;
  //     // if (d.values[1].val < 10) {
  //     //   console.log(d);
  //     // }
  //     prop.val = d.values[1].val;
  //     prop.pct = d.values[0].val;
  //   });

  const countiesPctData = nest()
    .key((d) => d.county)
    .entries(
      await csv('dist/data/countiesPctData.csv', (d) => ({
        county: d.county,
        year: 2000 + +d.year.slice(1),
        val: +d.val,
      })),
    );

  // const statesMapFiltered = {
  //   geometries: states.objects.states.geometries.filter(
  //     (d) => ![
  //       'Puerto Rico',
  //       'United States Virgin Islands',
  //       'Commonwealth of the Northern Mariana Islands',
  //       'Guam',
  //       'American Samoa',
  //     ].includes(d.properties.name),
  //   ),
  //   type: 'GeometryCollection',
  // };

  const resize = () => {
    makeStates(states);
    // makeOutOfStateBars({
    //   ...states,
    //   features: states.features.filter(
    //     (d) => d.properties.NAME !== 'California',
    //   ),
    // });
    makeCounties(counties);
    makeCountries(countries, countriesData);
    // makeCountriesStatic(countries, countriesData);
    // makeCountiesTs(countiesPctData);
  };
  window.addEventListener('resize', () => {
    resize();
  });
  resize();
})();
