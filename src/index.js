(async () => {
  // d3.json loads the file, this returns a promise and so we have to await for it
  const data = (await d3.json("data/testData.json")).california;

  // We can see that data is an array of objects of the form: { year, students }
  console.log(data);

  // select the html div
  const container = d3.select("#timeseries");

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
  // we want something like this:
  /*

    this is our SVG:
    - x values increase left to right
    - y values increase top to bottom

    | - - - - - size.width  - - - - - |
    ___________________________________   _
    |  __________margin.top_________  |    |
    | |                             | |    |
    | margin.left        margin.right |    size.height  
    | |_________margin.bottom_______| |    |
    |_________________________________|   _|

  */

  // put an svg inside of the div with our height and width
  const svg = container
    .append("svg")
    .attr("width", size.width)
    .attr("height", size.height)
    .style("border", "1px solid black");

  // d3.extent returns the min and max value in our array.
  // the second parameter we pass to this function is a function that returns the year or students value

  // range is the pixel range of our plot. The scaleLinear creates a linear mapping between the domain and range
  const x = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.year))
    .range([padding.left, size.width - padding.right]);

  // here we want the low values of range to be at the bottom of the plot so we start at the height - the bottom padding
  // we use d3.max here so that we can make sure the scale starts at 0
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.students)])
    .range([size.height - padding.bottom, padding.top]);

  // this calculates the path of our line
  // it always starts with d3.line() and then we have to specify the x and y pixel values
  // so therefore we use the x and y scales we just setup
  const line = d3
    .line()
    .x((d) => x(d.year))
    .y((d) => y(d.students));

  svg
    .datum(data)
    .append("path")
    .attr("fill", "none") // see what happens when we comment this line out!
    .attr("stroke", "black")
    .attr("d", line);

  // TODO:
  //
  // look at the bottom of the script here: https://www.d3-graph-gallery.com/graph/area_basic.html,
  // after the comment: // Add the area
  // and make an area to fill in, something like:
  /*    
        const area = d3.area()....
    */
  // then write code similar to lines 70-75/what's on the website to add the area
  // extending from y(0) to the line we have
})();
