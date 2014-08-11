/* Map Component by MinSoo Kim. (c) 2014 MinSoo Kim. (misol.kr@gmail.com) */
var map_zoom = 5, map_lat = '', map_lng = '', marker_latlng = '', map = '', marker = '', map_markers = new Array(), map_marker_positions = '', saved_location = new Array(), result_array = new Array(), infowindow = '', result_from = '';
/*

** 2014 08 11 TODO LIST **

map_marker_positions �� lat,lng;lat,lng; �������� ��Ŀ���� ��ġ�� ��� �����ϴ� �����̳�.
- ���� ó�� �ε��� ��Ŀ �ϳ��� ����
- ��Ŀ�� �߰��� �� ��ġ �߰�
- ��Ŀ�� ���ŵ� �� ��ġ ����
- ��Ŀ �̵��� ���� �� �߰��� ����.
- �˻� ������� ��� �׸��� Ŭ���ϴ� ���� ���� ��ġ�� �̵�.


��Ŀ�� �����̸�, ó�� ��Ŀ ��ġ�� map_marker_positions ���� ã�Ƽ�, �������� ���� ���� ��ġ�� ġȯ.
��Ŀ�� ����Ŭ���ϸ� map_marker_positions ���� ã�Ƽ� ��Ŀ�� �����ϰ�, �ʿ����� ��Ŀ ����
������ ����Ŭ���ϸ� ����Ŭ���� ��ġ�� ��Ŀ �����ϰ� map_marker_positions ���� ��Ŀ �߰�.
*/
function map_point(i) { //�˻��� ��ġ ������ �迭���� �ε�
	center = result_array[i].geometry.location;

	map.setCenter(center);
	latlng = center;
	marker_latlng = result_array[i].geometry.location;
	marker_code = marker_latlng.getLat() + marker_latlng.getLng();
	marker.setMap(null);
	marker = new daum.maps.Marker({
		position: marker_latlng, 
		map: map,
		draggable: true
	});
	soo_marker_event();
	marker.setMap(map);
	infowindow.close();

	infowindow = new daum.maps.InfoWindow({
		content: dragmarkertext + "<br /><strong>" + result_array[i].formatted_address + "</strong>",
		disableAutoPan: true
	});
	infowindow.open(map,marker);
}
function view_list() { //�˻��� ��ġ ������ �迭���� ����Ʈ�� �Ѹ�
	var html = '';
	if(result_array.length == 0) 
	{
		alert(no_result);
		return;
	}
	for(var i=0;i<result_array.length;i++) {
		if(i==0) {
			html += '<ul id="view_list">';
		}
		if(result_array.length==1) { map_point('0'); }
		var format_split = result_array[i].formatted_address.split(" ");
		var list_address = result_array[i].formatted_address.substring(result_array[i].formatted_address.lastIndexOf(format_split[format_split.length-3]));  
		html += "<li class=\"result_lists\"><a href=\"javascript:map_point('"+i+"');\">"+ list_address +"</a></li>";
	}
	html += '</ul>';
	jQuery("#result_list_layer").html(html);
	window.location.href = '#view_list';
}
function addAddressToMap(response, status) {
	result_array = new Array();
	result_array = response;
	view_list();
}
function showLocation(address) {
	result_from = '';
	if(!address) return;

	var params = new Array();
	params['component'] = "map_components";
	params['address'] = address;
	params['method'] = "search";

	var response_tags = new Array('error','message','results');
	exec_xml('editor', 'procEditorCall', params, function(a,b) { complete_search(a,b,address); }, response_tags);
}
function complete_search(ret_obj, response_tags, address) {
	var results = ret_obj['results'];
	if(results) results = results.item;
	else results = new Array();

	address_adder(results);
}
function address_adder(results) {
	var response = new Array();
	if(typeof(results.length) == "undefined") results = new Array(results);

	for(var i=0;i<results.length;i++) {
		if(results[i].formatted_address || results[i].formatted_address != null) {
			response[i] = { from: results[i].result_from,
				formatted_address: results[i].formatted_address,
				geometry: {location : new daum.maps.LatLng(results[i].geometry.lat, results[i].geometry.lng) } };
		}
	}
	addAddressToMap(response, 200);
}
function soo_marker_event() {
	daum.maps.event.addListener(marker, "dragstart", function() {
		infowindow.close();
	});
	daum.maps.event.addListener(marker, "dragend", function() {
		marker_latlng = marker.getPosition();
	});
}
function getMaps() {
	var mapOption = {
		level: 20-8,
		center: new daum.maps.LatLng(defaultlat, defaultlng)
	}
	map = new daum.maps.Map(document.getElementById("map_canvas"), mapOption);

	infowindow = new daum.maps.InfoWindow(map);

	if(typeof(opener) !="undefined" && opener != null)
	{
		var node = opener.editorPrevNode;
	}

	if(typeof(node) !="undefined" && node && node.nodeName == "IMG") {
		var img_var = {
				'component': 'map_components',
				'method': 'decode_data',
				'data': node.getAttribute('alt')
			};
		var img_data = new Array();

		var response_tags = new Array('error','message','results');
		exec_xml('editor', 'procEditorCall', img_var, function(ret_obj,b) {
				img_data = ret_obj['results'];

				saved_location['zoom'] = 20-img_data['map_zoom'];

				saved_location['center'] = new Array();
				var center_split = img_data['map_center'].split(',');
				saved_location['center']['lat'] = center_split[0];
				saved_location['center']['lng'] = center_split[1];

				if(!img_data['location_no']) {
					var marker_split = img_data['map_markers'].split(',');
					saved_location[0] = new Array();
					saved_location[0]['lat'] = marker_split[0];
					saved_location[0]['lng'] = marker_split[1];

					map_lat = saved_location['center']['lat'];
					map_lng = saved_location['center']['lng'];
					marker_lat = saved_location[0]['lat'];
					marker_lng = saved_location[0]['lng'];
					marker_latlng = new daum.maps.LatLng(marker_lat, marker_lng);
					latlng = marker_latlng;
					map_zoom = 20-parseInt(img_data['map_zoom'],10);
					if(marker_latlng) {
						latlng = marker_latlng
					}
					if(map_zoom) {
						jQuery("#map_zoom").val(map_zoom);
					}
					if(map_lat) {
						jQuery("#lat").val(map_lat);
					}
					if(map_lng) {
						jQuery("#lng").val(map_lng);
					}
				} else {
					var location_no = parseInt(img_data['location_no'],10);

					var markers_split = img_data['map_markers'].split(';');
					for(i=0;i<location_no;i++) {
						if(!markers_split[i]) continue;
						var marker_split = markers_split[i].split(',');
						saved_location[i] = new Array();
						saved_location[i]['lat'] = marker_split[0];
						saved_location[i]['lng'] = marker_split[1];
					}

					map_lat = saved_location['center']['lat'];
					map_lng = saved_location['center']['lng'];
					marker_lat = saved_location[0]['lat'];
					marker_lng = saved_location[0]['lng'];
					marker_latlng = new daum.maps.LatLng(marker_lat, marker_lng);
					latlng = marker_latlng;
					map_zoom = 20-parseInt(saved_location['zoom'],10);
					if(marker_latlng) {
						latlng = marker_latlng;
					}
					if(map_zoom) {
						jQuery("#map_zoom").val(map_zoom);
					}
					if(map_lat) {
						jQuery("#lat").val(map_lat);
					}
					if(map_lng) {
						jQuery("#lng").val(map_lng);
					}
				}
				map.setLevel(map_zoom);
				map.setCenter(new daum.maps.LatLng(map_lat, map_lng));
				var center = map.getCenter();

				marker = new daum.maps.Marker({
						position: latlng,
						map: map
					});
				soo_marker_event();
				marker.setMap(map);
				marker.setDraggable(true);
				jQuery("#lng").val(center.getLng());
				jQuery("#lat").val(center.getLat());
				jQuery("#map_zoom").value = map.getLevel();
				marker_latlng = latlng;
				infowindow.close();
			}, response_tags);
		/* ============================================ */
	} else {
		jQuery("#lat").val(defaultlat);
		map_lat = defaultlat;
		jQuery("#lng").val(defaultlng);
		map_lng = defaultlng;
		map.setCenter(new daum.maps.LatLng(map_lat, map_lng));
		var center = map.getCenter();
		marker_latlng = center;
		jQuery("#width").val('600');
		jQuery("#height").val('400');
		latlng = center;
		map.setLevel(map_zoom);

		marker = new daum.maps.Marker({
				position: latlng
			});
		soo_marker_event();
		marker.setMap(map);
		marker.setDraggable(true);
		jQuery("#lng").val(center.getLng());
		jQuery("#lat").val(center.getLat());
		jQuery("#map_zoom").value = map.getLevel();
		marker_latlng = latlng;
		infowindow.close();

	}
	var zoomControl = new daum.maps.ZoomControl();
	map.addControl(zoomControl, daum.maps.ControlPosition.LEFT);
	var mapTypeControl = new daum.maps.MapTypeControl();
	map.addControl(mapTypeControl, daum.maps.ControlPosition.TOPRIGHT);

	daum.maps.event.addListener(map, 'dragend', function() {
		center = map.getCenter();
		jQuery("#lng").val(center.getLng());
		jQuery("#lat").val(center.getLat());
		jQuery("#map_zoom").val(map.getLevel());
		var bounds = map.getBounds();
		var southWest = bounds.getSouthWest();
		var northEast = bounds.getNorthEast();
		if((latlng.getLng()<southWest.getLng() || northEast.getLng()<latlng.getLng()) || (latlng.getLat()<southWest.getLat() || northEast.getLat()<latlng.getLat())) {
			marker.setMap(null);
			infowindow.close();
			latlng = center;
			marker_latlng = latlng;
			marker = new daum.maps.Marker({
				position: center, 
				map: map
			});
			marker.setMap(map);
			marker.setDraggable(true);
			infowindow = new daum.maps.InfoWindow({
				content: dragmarkertext,
				disableAutoPan: true
			});
			infowindow.open(map,marker);
			soo_marker_event();
		}
	});
/*	daum.maps.event.addListener(map, 'dblclick', function(event) {
		center = event.latLng;
		jQuery("#lng").val(center.getLng());
		jQuery("#lat").val(center.getLat());
		jQuery("#map_zoom").val(map.getLevel());
		var bounds = map.getBounds();
		var southWest = bounds.getSouthWest();
		var northEast = bounds.getNorthEast();
		if((latlng.getLng()<southWest.getLng() || northEast.getLng()<latlng.getLng()) || (latlng.getLat()<southWest.getLat() || northEast.getLat()<latlng.getLat())) {
			marker.setMap(null);
			infowindow.close();
			latlng = center;
			marker_latlng = latlng;
			marker = new daum.maps.Marker({
				position: event.latLng, 
				map: map,
				draggable: true
			});
			marker.setMap(map);
			infowindow = new daum.maps.InfoWindow({
				content: dragmarkertext,
				disableAutoPan: true
			});
			infowindow.open(map,marker);
			soo_marker_event();
		}
	});
*/
}
function insertMap(obj) {
	if(typeof(opener)=="undefined" || !opener) return;
	var width = jQuery("#width").val(), height = jQuery("#height").val();
	if(saved_location.length == 0 || saved_location.length == 1) {
		map_zoom = 20-map.getLevel();
		map_lat = map.getCenter().getLat();;
		map_lng = map.getCenter().getLng();;
		if(!width) {width = '600'}
		if(!height) {height = '400'}
		if(!map_zoom) {map_zoom = '13'}
//XE���� �Ӽ� �����ϴ� �������� �ٲ�ٸ�, longd �� ����
		var img_var = {
				'component': 'map_components',
				'method': 'encode_data',
				'map_center': map_lat+','+map_lng,
				'width': width,
				'height': height,
				'map_markers': marker_latlng.getLat()+","+marker_latlng.getLng(),
				'map_zoom': map_zoom
			};
		var img_data = '';

		var response_tags = new Array('error','message','results');
		exec_xml('editor', 'procEditorCall', img_var, function(ret_obj,b) { 
				var results = ret_obj['results']; img_data = results;
				var text = "<img src=\"https://maps-api-ssl.google.com/maps/api/staticmap?center="+map_lat+','+map_lng+"&zoom="+map_zoom+"&size="+width+"x"+height+"&markers=size:mid|"+marker_latlng.getLat()+','+marker_latlng.getLng()+"&sensor=false\" editor_component=\"map_components\" alt=\""+img_data+"\" style=\"border:2px dotted #FF0033; no-repeat center;width: "+width+"px; height: "+height+"px;\" />";
				opener.editorFocus(opener.editorPrevSrl);
				var iframe_obj = opener.editorGetIFrame(opener.editorPrevSrl)
				opener.editorReplaceHTML(iframe_obj, text);
				opener.editorFocus(opener.editorPrevSrl);
				window.close();

			}, response_tags);
// dsfad
		
	} else {
// �Ⱦ�
		var text = "<img src=\"https://maps-api-ssl.google.com/maps/api/staticmap?center="+saved_location[0][1]+','+saved_location[0][2]+"&zoom="+saved_location[0][0]+"&size="+width+"x"+height+"&sensor=false\" editor_component=\"map_components\" width=\""+width+"\" height=\""+height+"\" style=\"width:"+width+"px;height:"+height+"px;border:2px dotted #FF0033;\"";
		text += ' location_no="' + saved_location.length + '"';
		text += ' map_zoom="' + saved_location['zoom'] + '"';
		text += ' map_center="' + saved_location['center']['lat'] + ',' + saved_location['center']['lng'];

		text += ' map_markers="';
		for(var i=0;i<saved_location.length;i++) {
			text += saved_location[i][3] + ',' + saved_location[i][4] + ';';
		}
		text += '" />';
	}
}
jQuery(document).ready(function() { getMaps(); });
