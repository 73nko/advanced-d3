async function drawMaps() {

  // 1. Access data

  const countryShapes = await d3.json("./../world-geojson.json")
  const dataset = await d3.csv("./../data_bank_data.csv")

  const countryNameAccessor = d => d.properties["NAME"]
  const countryIdAccessor = d => d.properties["ADM0_A3_IS"]
  const metric = "Population growth (annual %)"
  let metricDataByCountry = {}
  dataset.forEach(d => {
    if (d["Series Name"] != metric) return
    metricDataByCountry[d["Country Code"]] = +d["2017 [YR2017]"] || 0
  })

  // 2. Create chart dimensions

  let dimensions = {
    width: d3.min([900, window.innerWidth * 0.9]),
    margin: {
      top: 10,
      right: 40,
      bottom: 40,
      left: 40,
    },
  }
  dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right

  // 3. Draw canvas

  const container = d3.select("#wrapper")

  const wrapper = container.append("svg")
      .attr("width", dimensions.width)

  const bounds = wrapper.append("g")

  const sphere = ({type: "Sphere"})

  bounds.append("defs").append("clipPath")
      .attr("id", "bounds-clip-path")
    .append("path")
      .attr("class", "earth-clip-path")

  // 4. Create scales

  const metricValues = Object.values(metricDataByCountry)
  const metricValueExtent = d3.extent(metricValues)
  const maxChange = d3.max([-metricValueExtent[0], metricValueExtent[1]])
  const colorScale = d3.scaleLinear()
      .domain([-maxChange, 0, maxChange])
      .range(["indigo", "white", "darkgreen"])

  const builtInProjections = [ "geoAzimuthalEqualArea", "geoAzimuthalEquidistant", "geoGnomonic", "geoOrthographic", "geoStereographic", "geoEqualEarth", "geoAlbersUsa", "geoAlbers", "geoConicConformal", "geoConicEqualArea", "geoConicEquidistant", "geoEquirectangular", "geoMercator", "geoTransverseMercator", "geoNaturalEarth1", ]
  const geoProjectionProjections = [ "geoAiry", "geoAitoff", "geoAlbers", "geoArmadillo", "geoAugust", "geoAzimuthalEqualArea", "geoAzimuthalEquidistant", "geoBaker", "geoBerghaus", "geoBertin1953", "geoBoggs", "geoBonne", "geoBottomley", "geoBromley", "geoChamberlin", "geoChamberlinAfrica", "geoCollignon", "geoConicConformal", "geoConicEqualArea", "geoConicEquidistant", "geoCraig", "geoCraster", "geoCylindricalEqualArea", "geoCylindricalStereographic", "geoEckert1", "geoEckert2", "geoEckert3", "geoEckert4", "geoEckert5", "geoEckert6", "geoEisenlohr", "geoEquirectangular", "geoFahey", "geoFoucaut", "geoFoucautSinusoidal", "geoGilbert", "geoGingery", "geoGinzburg4", "geoGinzburg5", "geoGinzburg6", "geoGinzburg8", "geoGinzburg9", "geoGnomonic", "geoGringorten", "geoGuyou", "geoHammer", "geoHammerRetroazimuthal", "geoHealpix", "geoHill", "geoHomolosine", "geoHufnagel", "geoHyperelliptical", "geoKavrayskiy7", "geoLagrange", "geoLarrivee", "geoLaskowski", "geoLittrow", "geoLoximuthal", "geoMercator", "geoMiller", "geoModifiedStereographic", "geoModifiedStereographicAlaska", "geoModifiedStereographicGs48", "geoModifiedStereographicGs50", "geoModifiedStereographicMiller", "geoModifiedStereographicLee", "geoMollweide", "geoMtFlatPolarParabolic", "geoMtFlatPolarQuartic", "geoMtFlatPolarSinusoidal", "geoNaturalEarth1", "geoNaturalEarth2", "geoNellHammer", "geoNicolosi", "geoOrthographic", "geoPatterson", "geoPolyconic", "geoRectangularPolyconic", "geoRobinson", "geoSatellite", "geoSinusoidal", "geoSinuMollweide", "geoStereographic", "geoTimes", "geoTransverseMercator", "geoTwoPointAzimuthal", "geoTwoPointAzimuthalUsa", "geoTwoPointEquidistant", "geoTwoPointEquidistantUsa", "geoVanDerGrinten", "geoVanDerGrinten2", "geoVanDerGrinten3", "geoVanDerGrinten4", "geoWagner", "geoWagner4", "geoWagner6", "geoWagner7", "geoWiechel", "geoWinkel3", "geoInterrupt", "geoInterruptedHomolosine", "geoInterruptedSinusoidal", "geoInterruptedBoggs", "geoInterruptedSinuMollweide", "geoInterruptedMollweide", "geoInterruptedMollweideHemispheres", "geoPolyhedral", "geoPolyhedralButterfly", "geoPolyhedralCollignon", "geoPolyhedralWaterman", "geoQuincuncial", "geoGringortenQuincuncial", "geoPeirceQuincuncial", ]
  const projections = [
    ...builtInProjections,
    ...geoProjectionProjections,
  ]

  const selectedProjection = projections[0]
  const projectionLabel = d3.select("#name")
  projectionLabel.text(selectedProjection)

  const select = d3.select("#select")
  select.selectAll("option")
      .data(projections)
    .enter().append("option")
      .text(d => d)
      .attr("value", d => d)

  select.on("change", function(d) {
    projectionLabel.text(this.value)
    drawMap(this.value)
  })

  // 5. Draw data

  bounds.append("path")
      .attr("class", "earth")

  bounds.append("path")
      .attr("class", "graticule")

  const drawMap = projectionName => {
    const projection = d3[projectionName]()
      .fitWidth(dimensions.boundedWidth, sphere)

    const pathGenerator = d3.geoPath(projection)
    const [[x0, y0], [x1, y1]] = pathGenerator.bounds(sphere)

    dimensions.boundedHeight = y1
    dimensions.height = dimensions.boundedHeight + dimensions.margin.top + dimensions.margin.bottom
    wrapper.attr("height", dimensions.height)

    bounds.style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

    bounds.select(".earth")
        .attr("d", pathGenerator(sphere))
    bounds.select(".earth-clip-path")
        .attr("d", pathGenerator(sphere))

    const graticule = d3.geoGraticule10()
    bounds.select(".graticule")
        .attr("clip-path", "url(#bounds-clip-path)")
        .attr("d", pathGenerator(graticule))

    const countries = bounds.selectAll(".country")
      .data(countryShapes.features)

    countries.enter().append("path")
      .merge(countries)
        .attr("class", "country")
        .attr("fill", d => {
          const metricValue = metricDataByCountry[countryIdAccessor(d)] || 0
          return colorScale(metricValue)
        })
        .attr("title", d => countryNameAccessor(d))
        .attr("clip-path", "url(#bounds-clip-path)")
      .transition().duration(500)
        .attr("d", d => pathGenerator(d))
    countries.exit().remove()
  }

  drawMap(selectedProjection)

}
drawMaps()