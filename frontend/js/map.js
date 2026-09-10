let map, marker, routeLine, baseLayer, stationMarkers = [], lastMapFocusAt = 0, activeMapTrain = '', userInteracting = false, lastMapSize = '', markerAnimationFrame = 0;
const indiaBounds=L.latLngBounds([6.5,68],[35.5,97.5]);
function initMap(){
	if(map)return;
	map=L.map('map',{zoomControl:true, attributionControl:true, scrollWheelZoom:true, doubleClickZoom:true, boxZoom:true, touchZoom:true, zoomAnimation:false, fadeAnimation:false, markerZoomAnimation:false, maxBounds:indiaBounds, maxBoundsViscosity:1, worldCopyJump:false});
	map.fitBounds(indiaBounds,{padding:[8,8],animate:false});
	map.setMinZoom(map.getBoundsZoom(indiaBounds));
	map.on('zoomstart dragstart movestart',()=>{userInteracting=true;});
	map.on('zoomend dragend moveend',()=>{userInteracting=false;});
	baseLayer=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
		subdomains:'abc',
		maxZoom:19,
		noWrap:true,
		bounds:indiaBounds,
		attribution: '&copy; OpenStreetMap contributors'
	}).addTo(map);
}
function resizeMap(){
	if(!map)return false;
	const size=map.getSize();
	const sizeKey=`${size.x}x${size.y}`;
	if(sizeKey!==lastMapSize){
		map.invalidateSize({pan:false});
		lastMapSize=sizeKey;
	}
	const refreshedSize=map.getSize();
	return refreshedSize.x>0&&refreshedSize.y>0;
}
function clearStationMarkers(){
	stationMarkers.forEach(stationMarker=>map.removeLayer(stationMarker));
	stationMarkers=[];
}
function addStationMarkers(data){
	if(!Array.isArray(data.station_points)||stationMarkers.length)return;
	data.station_points.forEach(station=>{
		const latitude=Number(station.latitude), longitude=Number(station.longitude);
		if(!Number.isFinite(latitude)||!Number.isFinite(longitude))return;
		const stationMarker=L.circleMarker([latitude,longitude],{radius:5,color:'#f5c84b',weight:2,fillColor:'#07111f',fillOpacity:1}).addTo(map);
		stationMarker.bindTooltip(station.city||station.name,{permanent:true,direction:'top',className:'station-label',offset:[0,-5]});
		stationMarker.bindPopup(`<b>${station.city||station.name}</b><br>${station.name}<br><small>${station.distance_km} km from journey start</small>`);
		stationMarkers.push(stationMarker);
	});
}
function updateMap(data){
	const latitude=Number(data.latitude), longitude=Number(data.longitude);
	if(!Number.isFinite(latitude)||!Number.isFinite(longitude))return;
	const mapElement=document.getElementById('map');
	if(!mapElement||mapElement.offsetWidth===0||mapElement.offsetHeight===0)return;
	initMap();
	if(!resizeMap())return;
	const pos=[latitude,longitude];
	if(data.train_no!==activeMapTrain){
		activeMapTrain=data.train_no;
		lastMapFocusAt=0;
		cancelAnimationFrame(markerAnimationFrame);
		if(marker){map.removeLayer(marker);marker=null;}
		if(routeLine){map.removeLayer(routeLine);routeLine=null;}
		clearStationMarkers();
	}
	if(Array.isArray(data.route_path)&&data.route_path.length>1){
		if(!routeLine)routeLine=L.polyline(data.route_path,{color:'#42a9ff',weight:4,opacity:.85}).addTo(map);
		else routeLine.setLatLngs(data.route_path);
	}
	addStationMarkers(data);
	if(data.train_no===activeMapTrain&&lastMapFocusAt===0){
		map.fitBounds(indiaBounds,{padding:[8,8],animate:false});
		lastMapFocusAt=Date.now();
	}
	if(!marker){
		marker=L.marker(pos,{icon:L.divIcon({className:'train-map-pin',html:'<span class="train-map-emoji">🚆</span>',iconSize:[32,32],iconAnchor:[16,16]})}).addTo(map);
	}else if(data.journey_complete){cancelAnimationFrame(markerAnimationFrame);marker.setLatLng(pos);
	}else if(marker.getLatLng().lat!==latitude||marker.getLatLng().lng!==longitude){const from=marker.getLatLng(), started=performance.now();cancelAnimationFrame(markerAnimationFrame);const move=now=>{const progress=Math.min(1,(now-started)/2000);marker.setLatLng([from.lat+(latitude-from.lat)*progress,from.lng+(longitude-from.lng)*progress]);if(progress<1)markerAnimationFrame=requestAnimationFrame(move);};markerAnimationFrame=requestAnimationFrame(move);}
	marker.bindPopup(`<b>Train ${data.train_no}</b><br>${data.train_name}<br>${data.current_location} → ${data.next_station}<br><small>${latitude.toFixed(4)}, ${longitude.toFixed(4)}</small>`);
}
function resetMap(){cancelAnimationFrame(markerAnimationFrame);if(marker){map.removeLayer(marker);marker=null;}if(routeLine){map.removeLayer(routeLine);routeLine=null;}if(map){clearStationMarkers();map.fitBounds(indiaBounds,{padding:[8,8],animate:false});}activeMapTrain='';lastMapFocusAt=0;userInteracting=false;}
