// set the dimensions and margins of the graph
var margin = {top: 10, right: 330, bottom: 20, left: 50},
    width = 760 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
          
var allGroup = ["18-25", "25-35", "35-45", "45-55", "55-65", "65-109"];
d3.select("#selectButton")
      .selectAll('myOptions')
     	.data(allGroup)
      .enter()
    	.append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }); // corresponding value returned by the button

update("https://raw.githubusercontent.com/zzhj/d3percentstackbarchart/main/data/age_18-25.csv")

d3.select("#selectButton").on("change", function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        var datapath = "https://raw.githubusercontent.com/zzhj/d3percentstackbarchart/main/data/age_" + selectedOption + ".csv"
        update(datapath)
    })

// Update the Data
function update(datapath) {
  d3.csv(datapath).then(function(data) {
    svg.selectAll("*").remove();
  
    // List of subgroups = header of the csv files
    var subgroups = data.columns.slice(1)
  
    // List of groups = value of the first column called group 
    var groups = d3.map(data,function(d){return(d.group)})
  
    // Add X axis
    var x = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding([0.2])
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickSizeOuter(0));
  
    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, 100])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y));
       
    // color palette = one color per subgroup
    var color = d3.scaleOrdinal()
      .domain(subgroups)
      .range(["#441d03","#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061","#04002e"])
      
    // Add legend
    var legend = d3.legendColor()
      .title("Payment Choice")
      .titleWidth(100)
      .scale(color);
  
    // Normalize the data -> sum of each group must be 100
    dataNormalized = []
    data.forEach(function(d){
      // Compute the total
      tot = 0
      for (i in subgroups){ name=subgroups[i] ; tot += +d[name] }
      // Now normalize
      for (i in subgroups){ name=subgroups[i] ; d[name] = d[name] / tot * 100}
    })
  
    //stack the data? --> stack per subgroup
    var stackedData = d3.stack()
      .keys(subgroups)
      (data)
    
    
    // ----------------
    // Highlight a specific subgroup when hovered
    // ----------------
    var mouseover = function(event, d) {
    // what subgroup are we hovering?
    var subgroupName = d3.select(this.parentNode).datum().key; 
    subgroupName = subgroupName.split(" ").join("");
    subgroupName = subgroupName.split("/").join("");
    // Reduce opacity of all rect to 0.2
    d3.selectAll(".myRect").style("opacity", 0.2)
    d3.selectAll("."+subgroupName)
      .style("opacity", 1)
      .style("stroke-width", 3)
    }

  // When user do not hover anymore
  var mouseleave = function(event,d) {
    d3.selectAll(".myRect")
      .style("opacity",1)
      .style("stroke-width", 0)
    }
    
    // Show the bars
    svg.append("g")
      .selectAll("g")
      // Enter in the stack data = loop key per key = group per group
      .data(stackedData)
      .enter().append("g")
        .attr("fill", function(d) { return color(d.key); })
        .attr("class", function(d){ 
        var t = d.key.split(" ").join("");
        return "myRect " +  t.split("/").join(""); }) // Add a class to each subgroup: their name
        .style("stroke-width", 0)
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function(d) { return d; })
        .enter().append("rect")
          .attr("x", function(d) { return x(d.data.group); })
          .attr("y", function(d) { return y(d[1]); })
          .attr("height", function(d) { return y(d[0]) - y(d[1]); })
          .attr("width",x.bandwidth())
          .attr("stroke", "grey")
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave)
  
          
    svg.append("g")
      .attr("transform", "translate(460,10)")
      .call(legend)
  })
}