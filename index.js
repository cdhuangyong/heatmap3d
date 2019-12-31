import { HeatmapGL } from '../HeatmapGL.js'

const customLayer = {
	id: "heatmap",
	type: 'custom',
	renderingMode:"3d",
	onAdd: function (map, gl) {
		this.heatmapGL = new HeatmapGL({
			map:map,
			gl:gl,
			style:{
				blur: 20,
				colors: ["#2F65B3", "#0ff", "#37EF37", "#EBEB3C", "#E43838"],
				field: "权重字段",
				height: 200,
				opacity: 1,
				radius: 20,
				type: "density"
			}
		});
	},
	render: function (gl, matrix) {
		this.heatmapGL.render(gl,matrix);
	}
}


var map = new mapboxgl.Map({
	container: 'map',
	center:[116.47603366376346, 39.923537083352755],
	zoom:10,
	style:{
		"version": 8,
		"name": "Positron",
		"metadata": {},
		"glyphs": "fonts/{fontstack}/{range}.pbf",
		"sources": {},
		"layers": [],
		"transition": {
		  "duration": 0,
		  "delay": 0
		}
	}
});

map.on("load",function(){
	map.addLayer(customLayer);
});

