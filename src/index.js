import axios from 'axios';

// import css styles
import 'normalize.css';
import './styles.css';

import '../node_modules/font-awesome/css/font-awesome.css';

var dataset = [];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// use axios library for ajax request
axios.get('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json')
  .then(function (response){
    dataset = response.data;
    createMap();
  })
  .catch(function (error) {
    console.log(error);
  });

function getSVGWidth() {
  var width = window.innerWidth * .9;
  // create max and min-widths
  if (width < 310) {
      width = 310;
    }
  return width;
}

// create tooltip and append to body, add event listeners for window resizing
window.onload = function() {
  var testing;
  // create tooltip
  var tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip');

  // labels within tooltip that will display gdp and date data
  tooltip.append('div')
    .attr('class', 'tooltip-info');

window.addEventListener('resize', function(event) {
    var svgWidth = getSVGWidth();
    // remove old chart and legend box on resizing
    d3.select('svg').remove();
    d3.select('.legend').remove();
    createMap();
  });
};   

function mouseOverHandler(d) {
  var tooltipHeight = 80;
  var tooltipWidth = 150;

  d3.select('.tooltip')
    .attr('style', 'left: ' + (d3.event.pageX - (tooltipWidth / 2))
      + 'px; top:  ' + (d3.event.pageY - tooltipHeight - 30) + 'px;' 
      + 'height: ' + tooltipHeight + 'px; width: ' + tooltipWidth + 'px;')
    .classed('show-tooltip', true);
  
  // tooltip info goes here
  
  d3.select('.tooltip-info')
    .html(
      MONTHS[d.month-1] + ', ' + d.year + '<br>' 
      + 'Temp: ' + (dataset.baseTemperature + d.variance).toFixed(2) + '&deg;C' + '<br>'
      + 'Variance: ' + d.variance.toFixed(2) + '&deg;C'
    );
}

// this function will return a color based on passed in temp value
function getColorFromTemp(temp, scale) {
  var color = (d3.interpolateRdYlBu(scale(temp)));

  return color;
}

function getMinTemp() {
  return d3.min(dataset.monthlyVariance, function(d) {
    return d.variance;
  });
}
function getMaxTemp() {
  return d3.max(dataset.monthlyVariance, function(d) {
    return d.variance;
  });
}

function createMap() {
  var barHeight = 30;
  var svgWidth = getSVGWidth();
  var svgHeight = 440;
  var svgPadding = 40;
  var svgPaddingTop = 20;
  var svgPaddingLeft = 50;
  var svgPaddingRight = 10;
  var svgPaddingBottom = 40;

  // create color scale for use with the d3 chromatic scale plugin
  var colorScale = d3.scaleLinear()
  .domain([getMinTemp(), getMaxTemp()])
  .range([1,0])

  // create graph and append to div
  var svg = d3.select('.graph-container').append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight)
  .attr('class', 'graph');

  var xScale = d3.scaleLinear()
    .domain(
      [dataset.monthlyVariance[0].year, 
      dataset.monthlyVariance[dataset.monthlyVariance.length-1].year]
    )
    .range([svgPaddingLeft, svgWidth - svgPaddingRight]);

  // TODO: create range values dynamically
  var rangeValues = [];
  for (var i = 0; i < MONTHS.length; i++) {
    rangeValues.push(svgPadding + (i * barHeight));
  }

  // create y scale
  // add slight padding to max value
  var yScale = d3.scaleOrdinal()
    .domain(MONTHS)
    .range(rangeValues);

    // create data points/append rects to svg
  svg.selectAll('rect')
    .data(dataset.monthlyVariance)
    .enter()
    .append('rect')
    .attr('x', function(d) {
      return xScale((d.year));
    })
    .attr('y', function(d) {
      return yScale(MONTHS[d.month - 1]);
    })
    .attr('height', barHeight)
    // make bar widths responsive based on width of screen
    .attr('width', svgWidth / (dataset.monthlyVariance.length / 20))
    // change this to reflect temperature
    .attr('fill', function(d) {
      return getColorFromTemp(d.variance, colorScale);
    })

    // add mouseover event to each bar
    //.on('mouseenter', mouseOverHandler)
    .on('mousemove', mouseOverHandler)
    .on('mouseover', mouseOverHandler)
    .on('mouseleave', function() {
      d3.select('.tooltip')
        .classed('show-tooltip', false);
    });

  // add graph title
  svg.append('text')
    .attr('x', svgWidth / 2 )
    .attr('y', 25)
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
    .attr('y', 10)
    .style('text-anchor', 'middle')
    .text('Month')
    .attr('transform', 'rotate(-90)');

  // create x and y axis
  var xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.format("d"));
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

   var yAxis = d3.axisLeft(yScale)
    .tickSize(0);
   svg.append('g')
    .attr('transform', 'translate(' + svgPaddingLeft + ',' + (barHeight / 2) + ')')
    .classed('yAxis', 'true')
    .call(yAxis);

  createColorLegend();
}

function createColorLegend() {
  // get width of legend based on width of window
  var legendWidth = 210;
  var legendHeight = 20;
  var barWidth = 10;

  // use color red to blue color spectrum
  var colorSpectrum = d3.schemeRdYlBu; 

  var svg = d3.select('.legend-container').append('svg')
    .attr('width', legendWidth)
    .attr('height', legendHeight)
    .attr('class', 'legend');

  // use the 11-length spectrum option and reverse so that it goes
  // from blue to red
  svg.selectAll('rect')
    .data(colorSpectrum[11].reverse())
    .enter()
    .append('rect')
    .attr('x', function(d, i) {
      return i * barWidth + 50;
    })
    .attr('y', 0)
    .attr('height', legendHeight)
    .attr('width', barWidth)
    .attr('fill', function(d) {
      return d;
    });

    // create labels for legend
    svg.append('text')
      .attr('x', 10)
      .attr('y', 16)
      .attr('class', 'legend-label')
      .text((dataset.baseTemperature + getMinTemp()).toFixed(2) + '\xB0C');

    svg.append('text')
      .attr('x',  legendWidth - 45)
      .attr('y', 16)
      .attr('class', 'legend-label')
      .text((dataset.baseTemperature + getMaxTemp()).toFixed(2) + '\xB0C');
}