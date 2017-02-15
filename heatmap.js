var dataset = [];

var svgWidth = getSVGWidth();
var svgHeight = 500;
var svgPadding = 40;
var svgPaddingTop = 20;
var svgPaddingLeft = 80;
var svgPaddingRight = 110;
var svgPaddingBottom = 40;
var tooltipHeight = 100;
var tooltipWidth = 200;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// use axios library for ajax request
axios.get('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json')
  .then(function (response){
    dataset = response.data;
    console.log(dataset.monthlyVariance[0].year);
    createMap();
  })
  .catch(function (error) {
    console.log(error);
  });

function getSVGWidth() {
  var width = window.innerWidth * .85;
  // create max and min-widths
  if (width < 310) {
      width = 310;
    }
  return width;
}

// create tooltip and append to body, add event listeners for window resizing
window.onload = function() {
  // create tooltip
  var tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip');

  // labels within tooltip that will display gdp and date data
  tooltip.append('div')
    .attr('class', 'tooltip-info');

window.addEventListener('resize', function(event) {
    svgWidth = getSVGWidth();
    // remove old chart and legend box on resizing
    d3.select('svg').remove();
    d3.select('.legend-box').remove();
    createMap();
  });
};   

function mouseOverHandler(d) {
  d3.select('.tooltip')
    .attr('style', 'left: ' + (d3.event.pageX - (tooltipWidth / 2))
      + 'px; top:  ' + (d3.event.pageY - tooltipHeight - 30) + 'px;' 
      + 'height: ' + tooltipHeight + 'px; width: ' + tooltipWidth + 'px;')
    .classed('show-tooltip', true);

  // d3.select(d3.event.target)
  //   .attr('r', circleRadius + 2);
  

  // tooltip info goes here
  /*
  d3.select('.tooltip-info')
    .html(d.Name + ': ' + d.Nationality + '<br>' 
      + 'Year: ' + d.Year + '<br>'
      + 'Place: ' + d.Place + '<br>'
      + 'Time: ' + d.Time + '<br><br>'
      +  (d.Doping ? d.Doping : 'No doping allegations'));
    */
}


function createMap() {
  console.log(dataset);

  // create graph and append to div
  var svg = d3.select('.graph-container').append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight)
  .attr('class', 'graph');

  // create x scale
  // add slight padding to max value

  
  xScale = d3.scaleLinear()
    .domain(
      [dataset.monthlyVariance[0].year, 
      dataset.monthlyVariance[dataset.monthlyVariance.length-1].year]
    )
    .range([svgPaddingLeft, svgWidth - svgPaddingRight]);

  // TODO: create range values dynamically
  var rangeValues = [];
  for (var i = 0; i < MONTHS.length; i++) {
    rangeValues.push(svgPadding + (i * 30));
  }

  // create y scale
  // add slight padding to max value
  yScale = d3.scaleOrdinal()
    .domain(MONTHS)
    .range(rangeValues);

    // create data points/append rects to svg
  svg.selectAll('rect')
    .data(dataset)
    .enter()
    .append('rect')
    .attr('x', function(d) {
      return xScale((d));
    })
    .attr('y', function(d) {
      return yScale();
    })
    .attr('height', '30px')
    // change this to reflect temperature
    .attr('fill', function(d) {
      return 'yellow';
    })

    // add mouseover event to each bar
    //.on('mouseenter', mouseOverHandler)
    //.on('mousemove', mouseOverHandler)
    .on('mouseover', mouseOverHandler)
    .on('mouseleave', function() {
      d3.select('.tooltip')
        .classed('show-tooltip', false);
    });

  // add graph title
  svg.append('text')
    .attr('x', svgWidth / 2 )
    .attr('y', 20)
    .attr('class', 'graph-title')
    .style('text-anchor', 'middle')
    .text('Global Land-Surface Temperature');

  // add x-axis label
  svg.append('text')
    .attr('x', svgWidth / 2 )
    .attr('y', svgHeight - 5)
    .style('text-anchor', 'middle')
    .text('Year');

  // add y-axis label
  svg.append('text')
    .attr('x', 0 - (svgHeight / 2))
    .attr('y', (svgPadding - 10))
    .style('text-anchor', 'middle')
    .text('Month')
    .attr('transform', 'rotate(-90)');

  // create x and y axis
  var xAxis = d3.axisBottom(xScale);
  svg.append('g')
  .attr('transform', 'translate(2,' + (svgHeight - svgPadding) + ')')
  .style('font-size', function() {
    if (svgWidth < 400) {
      return '6px';
    } else if ( svgWidth < 500) {
      return '8px';
    } else {
      return '12px';
    }
  })
  .call(xAxis);

   var yAxis = d3.axisLeft(yScale);
   svg.append('g')
    .attr('transform', 'translate(' + svgPaddingLeft + ',0)')
    .call(yAxis);

}