var width = 800;
var height = 600;
var modalDetails = d3.select(".modal");
var modalFilter = d3.select(".modalFilter");
var grid = d3.select(".grid-container");
var filterResults = d3.select(".filter");
var current;
var clickedPosition = [];

//inicijaliziranje svg elementa
var svg = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g");

//definiranje projekcije
var projection = d3.geo.mercator()
    .center([13, 52])
    .translate([width / 2, height / 2])
    .scale([width / 1.5]);

var path = d3.geo.path()
    .projection(projection);

//iscrtavanje granica drzava
d3.json("europe.json", function (json) {
    svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "country")
        .attr("stroke", "rgba(255,255,255, 0.5)")
        .style('fill', function (d, i) {
            svg
                .append('defs')
                .append('pattern')
                .attr('id', d.properties.id)
                .attr('patternUnits', 'userSpaceOnUse')
                .attr('width', 800)
                .attr('height', 600)
                .append('image')
                .attr('xlink:href', d.properties.url)
                .attr('x', d.properties.x)
                .attr('y', d.properties.y)
                .attr("width", d.properties.width)
                .attr('height', d.properties.height)
                .style('object-fit', 'cover')
            return 'url(#' + d.properties.id + ')'
        })
        .on("mouseover", mouseover)
        .on("click", clicked)
});

for (var i = 0; i < 51; i++) {
    clickedPosition.push(false);
}

//ispis naziva drzave na hover
function mouseover(d, i) {
    d3.select('.countryName')
        .text('Country: ' + d.properties.name);
}

function clicked(d, i) {
    saveCountry(d);
    if (d.properties.id == 14 || d.properties.id == 23 || d.properties.id == 32 || d.properties.id == 36 || d.properties.id == 41) {
        zoomIn(d, i, d.properties.id);
    }
    else {
        zoomIn(d, i, 0);
    }
}

function saveCountry(d) {
    current = d;
}

//priblizavanje drzave
function zoomIn(d, i, id) {
    var button = d3.select("#animalInfo");
    if (!clickedPosition[i]) {
        button.style("display", "block");
        var [[x0, y0], [x1, y1]] = path.bounds(d);
        if (id == 14 || id == 32)
            y0 = 10;
        else if (id == 23)
            x1 = 580;
        else if (id == 36) {
            y0 = 25;
            x1 = 515;
        }
        else if (id == 41)
            y0 = 14;
        var x, y, scale;
        d3.selectAll("path").style("opacity", 1);
        scale = Math.min(7, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height));
        x = (x0 + x1) / 2;
        y = (y0 + y1) / 2;
        d3.selectAll("path.country").transition()
            .duration(750)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + scale + ")translate(" + -x + "," + -y + ")");
        for (var j = 0; j < 51; j++) {
            clickedPosition[j] = false;
        }
        clickedPosition[i] = true;
    }
    else if (clickedPosition[i]) {
        button.style("display", "none");
        clickedPosition[i] = false;
        x = width / 2;
        y = height / 2;
        scale = 1;
        svg.selectAll("path.country").transition()
            .duration(750)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + scale + ")translate(" + -x + "," + -y + ")");
    }
}

var checkbox = d3.select("#showOnMap").on("change", checkboxChange);
var select = d3.select('#region')
    .attr('class', 'select')
    .on('change', selectChanged);
var selectValue = d3.select("select").property("value");

function checkboxChange() {
    if (checkbox.property("checked")) {
        region = document.getElementById('region');

        outlineCountries(selectValue);

    }
    else {
        clearOutline();
    }
}

function selectChanged() {
    clearOutline();
    selectValue = d3.select('#region').property('value');

    if (checkbox.property("checked")) {
        outlineCountries(selectValue);
    }

}

//oznacavanje dijela europe
function outlineCountries(value) {
    countries = d3.selectAll("path").filter(function (d) {
        return d.properties.region == value;
    });
    countries.attr("stroke", "gold").attr("stroke-width", "2.5px");
}

function clearOutline() {
    d3.selectAll("path").attr("stroke", "rgba(255,255,255, 0.5)").attr("stroke-width", "1px");
}

function openInfo() {
    grid.append("div").attr("class", "title").text(current.properties.name + " - " + current.properties.animal);
    grid.append("img").attr("class", "image").attr("src", current.properties.url);
    grid.append("div").attr("class", "main").text(current.properties.info);
    grid.append("div").attr("class", "right").text("Check out more about the animal: ").append("a").attr("href", current.properties.more).text(current.properties.animal);
    modalDetails.style("display", "block");
}

d3.select(".close").on("click", closeDetails);
d3.select(".closeFilter").on("click", closeFilter);

//uklanjanje elemenata nakon zatvaranja modala
function closeDetails() {
    modalDetails.style("display", "none");
    grid.selectAll("div").remove();
    grid.selectAll("img").remove();
}

function closeFilter() {
    modalFilter.style("display", "none");
    filterResults.selectAll("row").remove();
    filterResults.selectAll("column").remove();
    filterResults.selectAll("img").remove();
    filterResults.selectAll("div").remove();
    filterResults.selectAll("p").remove();
    filterResults.selectAll("h3").remove();
    filterResults.selectAll("h6").remove();
}
var found = false;
var data;
d3.json("europe.json", function (d) {
    data = d.features;
});

//filtriranje rezultata
function filter() {
    conservation = d3.select('#conservation').property('value');
    conservationText = d3.select("#conservation option:checked").text();

    species = d3.select("#species").property("value");
    speciesText = d3.select("#species option:checked").text();
    region = d3.select("#region").property("value");
    regionText = d3.select("#region option:checked").text();
    results = data.filter(function (d) {
        return d.properties.region == region;
    })
    filterResults.select("h2").append("h6").text(conservationText + " " + speciesText + " in " + regionText);
    filterResults.append("div").attr("class", "row");

    for (var i = 0; i < results.length; i++) {
        if (results[i][species][conservation] != "") {
            found = true;
            filterResults.select(".row").append("div").attr("class", "column").attr("id", "col" + results[i].properties.id);
            filterResults.select("#col" + results[i].properties.id).append("div").attr("class", "content").attr("id", "content" + results[i].properties.id);
            filterResults.select("#content" + results[i].properties.id).append("img").attr("src", results[i][species][conservation + "Url"]);
            filterResults.select("#content" + results[i].properties.id).append("h3").text(results[i][species][conservation]);
            filterResults.select("#content" + results[i].properties.id).append("p").text(results[i].properties.name);
        }
    }
    if (!found) {
        filterResults.append("div").text("No results found!").style("text-align", "center");
    }
    modalFilter.style("display", "block");
    found = false;
}