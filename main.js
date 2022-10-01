/* ---- WORLD WIND CONFiG ----- */

const wwd = new WorldWind.WorldWindow("canvasOne");

// very low resolution version of NASA’s Blue Marble
// which it may be used as a ‘fallback’ 
// if Web WorldWind is not able to request online imagery layers
wwd.addLayer(new WorldWind.BMNGOneImageLayer());

// Landsat imagery with higher resolution
wwd.addLayer(new WorldWind.BMNGLandsatLayer());
wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
// wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));
// Star field
const starFieldLayer = new WorldWind.StarFieldLayer();
const atmosphereLayer = new WorldWind.AtmosphereLayer();
wwd.addLayer(starFieldLayer);
wwd.addLayer(atmosphereLayer);
// Atmosphere
wwd.addLayer(new WorldWind.AtmosphereLayer(wwd));
// show night and day sides
const now = new Date();
starFieldLayer.time = now;
atmosphereLayer.time = now;


// ISS Mapping
function mapISStoCanvas() {
    // fetch ISS TLE
    fetch('https://tle.ivanstanojevic.me/api/tle/25544')
    .then(response => response.json())
    .then(data => {
        // Initialize the satellite record with this TLE
        const satrec = satellite.twoline2satrec(
            data.line1.trim(),
            data.line2.trim(),
        );
        // Get the position of the satellite at the given date
        const date = new Date();
        const positionAndVelocity = satellite.propagate(satrec, date);
        const gmst = satellite.gstime(date);
        const iss_position = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
        
        // Add a satellite Layer
        const satelliteMarkerLayer = new WorldWind.RenderableLayer();
        wwd.addLayer(satelliteMarkerLayer);

        const satelliteAttributes = new WorldWind.PlacemarkAttributes(null);
        satelliteAttributes.imageScale = 0.15;
        satelliteAttributes.imageOffset = new WorldWind.Offset(
            WorldWind.OFFSET_FRACTION, 0.3,
            WorldWind.OFFSET_FRACTION, 0.0);
        satelliteAttributes.labelAttributes.offset = new WorldWind.Offset(
            WorldWind.OFFSET_FRACTION, 0.5,
            WorldWind.OFFSET_FRACTION, 1.0);
        satelliteAttributes.imageSource = '/images/iss/iss.png';

        // Map the position
        const position = new WorldWind.Position(iss_position.latitude, iss_position.longitude, iss_position.height*1000);
        const issSatellite = new WorldWind.Placemark(position, false, satelliteAttributes);

        issSatellite.label = "Space Station"
        issSatellite.alwaysOnTop = true;

        // write it's position to document
        const node = document.querySelector('#satellite-pos');
        node.innerHTML = `
            <b>International Space Station</b><br>
            <span>Latitude: ${(iss_position.latitude).toPrecision(7).toString()} (rad)</span><br>
            <span>Longitude: ${(iss_position.longitude).toPrecision(7).toString()} (rad)</span><br>
            <span>Altitude: ${Math.round(iss_position.height * 1000).toString()} (km)</span><br>
        `

        satelliteMarkerLayer.addRenderable(issSatellite);
    })
}

// map ISS
mapISStoCanvas()
// Get and map position of the ISS
// after each 2 seconds
setInterval(mapISStoCanvas, 2000);