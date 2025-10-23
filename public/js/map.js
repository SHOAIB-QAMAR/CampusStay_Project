mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map',
    style: "mapbox://styles/mapbox/streets-v12",
    center: [78.0727677045917, 27.916476898974345],
    zoom: 5
});

const defaultMarker = new mapboxgl.Marker({ color: "blue" })
    .setLngLat([78.0727677045917, 27.916476898974345])
    .setPopup(new mapboxgl.Popup({ offset: 25 })
        .setHTML("<h4>AMU, Aligarh</h4><p>Default city location</p>"))
    .addTo(map);

const listingMarker = new mapboxgl.Marker({ color: "red" })
    .setLngLat(listing.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h4>${listing.location}</h4><p>Exact location will be provided after booking</p>`))
    .addTo(map);

const bounds = new mapboxgl.LngLatBounds();
bounds.extend([78.0727677045917, 27.916476898974345]);
bounds.extend(listing.geometry.coordinates);
map.fitBounds(bounds, { padding: 50 });