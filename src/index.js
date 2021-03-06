(async () => {
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

  const container = d3.select("#timeseries");

  // this div contains the selection
  // add margin with .style() (works similar to .attr()) to give it some space from the plot
  container.style("margin", "35px");
  // when you are using .style() look up how to do it in CSS
  // for example https://www.w3schools.com/cssref/pr_margin.asp
  const inputArea = container.append("div");
  // this is a label tag for the selection input
  // add a .text() and enter a string to make the label
  inputArea.text("Dropdown Menu");
  // add right margin with .style() to give some space between the text and the dropdown

  // change the font family to Helvetica Neue,Helvetica,Arial,sans-serif
  inputArea.style("font-family", "Helvetica Neue,Helvetica,Arial,sans-serif");
  inputArea.append("label").attr("for", "stateSelection").style("margin-right","30px");

  const stateInput = inputArea.append("select").attr("name", "stateSelection");

  const size = {
    width: 600,
    height: 200,
  };

  const margin = {
    left: 10,
    right: 10,
    top: 10,
    bottom: 30,
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

  const makePlot = (stateName) => {
    const state = states.find(({ name }) => name === stateName);

    // d3.extent returns the min and max value in our array.
    // the second parameter we pass to this function is a function that returns the year or students value

    // range is the pixel range of our plot. The scaleLinear creates a linear mapping between the domain and range
    const x = d3
      .scaleLinear()
      .domain(d3.extent(state.values, (d) => d.year))
      .range([margin.left, size.width - margin.right]);

    // here we want the low values of range to be at the bottom of the plot so we start at the height - the bottom padding
    // we use d3.max here so that we can make sure the scale starts at 0
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(state.values, (d) => d.count)])
      .range([size.height - margin.bottom, margin.top]);
 

    // this calculates the path of our line
    // it always starts with d3.line() and then we have to specify the x and y pixel values
    // so therefore we use the x and y scales we just setup
    const line = d3
      .line()
      .x((d) => x(d.year))
      .y((d) => y(d.count));

    svg
      .selectAll(".timeseriesPlot")
      .data([state.values])
      .join("path")
      .attr("class", "timeseriesPlot")
      .attr("fill", "none") // see what happens when we comment this line out!
      .attr("stroke", "green")
      .transition()      // uncomment these out to see a smooth transition when we change the state
      .duration(1000)
      .attr("d",line);

    // TODO:
    //
    // look at the bottom of the script here: https://www.d3-graph-gallery.com/graph/area_basic.html,
    // after the comment: // Add the area
    // and make an area to fill in, something like:
    /*
        const area = d3.area()....
    */
    // then write code similar to lines 77-86/what's on the website to add the area
    // extending from y(0) to the line we have

    
    // add area here
    const area = d3.area()
      .x((d) => x(d.year))
      .y1((d) => y(d.count))
      .y0(y(0));

    svg
      .selectAll(".timeseriesArea")
      .data([state.values])
      .join("path")
      .attr("class", "timeseriesArea")
      .attr("fill", "#cce5df")
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", 1.5)
      .attr("d", area);
      
    //unfinished?

    // change the attribute fill color
    // set the fill-opacity attribute to something between 0-1
    //area.attr("fill-opacity", "0.5");
    //
    svg
      .append("g")
      .attr("transform", `translate(0, ${size.height - margin.bottom})`)
      .style("font-family", "Helvetica Neue,Helvetica,Arial,sans-serif")
      .style("font-size", "16px")
      .attr("color", "#adadad")
      .call(d3.axisBottom(x).tickFormat((d) => d));
  };
/*
  makePlot("California");

  setTimeout(() => {
    makePlot("Colorado");
  }, 2000);
*/
makePlot("Alabama");
  // TODO

  // append `option` tags
  // add the `value` attribute with the value being the state's name
  // add the .text() of the state's name to get the values to display in the drop down
  // https://stackoverflow.com/a/43122306
var options = stateInput.selectAll("option")
  .data(states)
  .enter()
  .append("option");

options.text(function(d) {
    return d.name;
  })
  .attr("value", function(d) {
    return d.name;
  });

  // add an event listener (.on()) for "input".
  // this way, everytime you select something from the dropdown, this function is called
  // the second argument is a function which the event is passed to
  // the state's name is at event.target.value
  // then call the makePlot function with this value
  // see: https://gramener.github.io/d3js-playbook/events.html

  stateInput.on("input", function(){
    var tarVal = event.target.value;
    makePlot(tarVal);
  });
})();

// Other things to look at:
const myArr = [1, 2, 3, 4, 5, 6];
const squares = null; // use the array .map function to return an array squaring each number in myArr: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
console.log(squares);

// use .filter() to get the even numbers out of myArr:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
const evens = null;
console.log(evens);

// compute the sum of all of the numbers in myArr using .reduce()
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
const sum = null;
console.log(sum);