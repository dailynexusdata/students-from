(async () => {
  const mapData = await d3.json(
    "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"
  );

  const mapStates = {
    geometries: mapData.objects.states.geometries.filter(
      (d) =>
        ![
          "Puerto Rico",
          "United States Virgin Islands",
          "Commonwealth of the Northern Mariana Islands",
          "Guam",
          "American Samoa",
        ].includes(d.properties.name)
    ),
    type: "GeometryCollection",
  };

  const states = (await d3.csv("data/states.csv")).map((d) => {
    const name = d.State;
    delete d["State"];
    return {
      name,
      values: Object.entries(d).map(([a, b]) => {
        return { year: +a, count: +b };
      }),
    };
  });

  const year = 2021;
  const weekData = states.map(({ name, values }) => {
    return {
      name,
      val: values.find((d) => d.year === year),
    };
  });

  console.log(weekData);

  // select the html div
  const container = d3.select("#map");

  const size = {
    width: 600,
    height: 400,
  };

  const padding = {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10,
  };

  const svg = container
    .append("svg")
    .attr("width", size.width)
    .attr("height", size.height);

  const projection = d3.geoAlbersUsa().scale(750).translate([320, 200]);
  const path = d3.geoPath().projection(projection);

  console.log(mapStates);

  const map = svg
    .selectAll("path")
    .data(topojson.feature(mapData, mapStates).features)
    .join("g");

  map
    .append("path")
    .attr("d", path)
    .attr("fill", "none")
    .attr("stroke", "black");

  const r = d3.scaleLinear().domain([0, 20000]).range([0, 5]);

  map
    .append("circle")
    .attr("r", 3)
    .attr("fill", "green")
    .attr("transform", (county) => {
      const translation = path.centroid(county.geometry);

      return `translate(${translation[0]},${translation[1]})`;
    });
})();