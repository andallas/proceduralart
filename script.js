seed = Math.round(Math.random() * Number.MAX_SAFE_INTEGER);

if (getQueryParams(document.location.search).planet !== undefined) {
	seed = getQueryParams(document.location.search).planet;
}

document.getElementById('permalink').href = 'index.html?planet=' + seed;

noise.seed(seed % 10000);

var scene = {};
var ctx;
var canvas;
var width;
var height;

var imageData;
var buffer;

function setupCanvas() {
	canvas = document.getElementById("myCanvas");
	ctx = canvas.getContext("2d");
	ctx.fillStyle = 'black';

	width = canvas.width;
	height = canvas.height;

	ctx.fillRect(0,0,width, height);
}

function setupBuffer() {
	imageData = ctx.getImageData(0,0, width, height);
	buffer = imageData.data;
}

function applyBuffer() {
	ctx.putImageData(imageData, 0, 0);
}

function setPixel(x, y, color, alpha) {
	setPixelRGB(x,y,color.r, color.g, color.b, alpha);
}

function setPixelRGB(x, y, r, g, b, alpha) {
	if (x >= width || y >= height || x < 0 || y < 0)
		return;
	x = Math.floor(x);
	y = Math.floor(y);
	if (alpha === undefined)
		alpha = 1;
	if (alpha <= 0)
		return;
	if (alpha > 1)
		alpha = 1;

	
	if (alpha == 1) {
		buffer[(y * width + x) * 4 + 0] = r;
		buffer[(y * width + x) * 4 + 1] = g;
		buffer[(y * width + x) * 4 + 2] = b;
	} else {
		buffer[(y * width + x) * 4 + 0] = Math.floor((1 - alpha) * buffer[(y * width + x) * 4 + 0] + alpha * r);
		buffer[(y * width + x) * 4 + 1] = Math.floor((1 - alpha) * buffer[(y * width + x) * 4 + 1] + alpha * g);
		buffer[(y * width + x) * 4 + 2] = Math.floor((1 - alpha) * buffer[(y * width + x) * 4 + 2] + alpha * b);
	}
}

function drawBrightStar(x,y,size) {
	ctx.fillStyle = "rgba(255,255,255,0.03)";	
	ctx.beginPath();
	ctx.arc(x,y,size,0,2*Math.PI);
	ctx.fill();
	
	ctx.fillStyle = "rgba(255,255,255,0.1)";	
	ctx.beginPath();	
	ctx.arc(x,y,size * 0.4,0,2*Math.PI);
	ctx.fill();
	
	ctx.fillStyle = "rgba(255,255,255,1.0)";
		
	setPixelRGB(x,y, 255,255,255,1);
	setPixelRGB(x-1,y+1, 255,255,255,0.8);
	setPixelRGB(x+1,y+1, 255,255,255,0.8);
	setPixelRGB(x+1,y-1, 255,255,255,0.8);
	setPixelRGB(x-1,y-1, 255,255,255,0.8);
	
	p = 0;
	for (var i = -1; i <= 1; i += 0.05) {
		new_p = Math.floor(size * 0.6 * i);
		if (new_p == p)
			continue;
		p = new_p;
		setPixelRGB(x, y + p, 255,255,255,1.001 - Math.abs(i));
		setPixelRGB(x + p, y, 255,255,255,1.001 - Math.abs(i));
	}
}

function drawStarships(x, y) {
	var dx = getInt(3, getPivot('starshipdir')) - 1;
	var dy = dx == 0 ? 1 : 0;
	var dx2 = dy;
	var dy2 = 1 - dy;
	var size = getInt(8, getPivot('starshipsize')) + 5;
	if (size % 2 == 0) size++;
	var count = Math.floor(Math.pow(getFloat(getPivot('starshipcount')), 3) * 4) + 1;
	var spread = getFloat(getPivot('starshipspread')) * 2;
	
	for (var i = 0; i < count; i++) {
		for (var j = 0; j < size; j++) {
			for (var k = 0; k < j; k++) {
				setPixelRGB(x + dx2 * i * size * 1.5 + dx * i * spread * size + j * dx + (k - j / 2) * dx2,
				            y + dy2 * i * size * 1.5 + dy * i * spread * size + j * dy + (k - j / 2) * dy2, 0, 0, 0, 1);
				setPixelRGB(x - dx2 * i * size * 1.5 + dx * i * spread * size + j * dx + (k - j / 2) * dx2,
				            y - dy2 * i * size * 1.5 + dy * i * spread * size + j * dy + (k - j / 2) * dy2, 0, 0, 0, 1);
			}
		}
	}
	
	var exhausthue = scene.skyhue + 0.25 * (1 + getInt(3, getPivot('exhausthue')));
	if (exhausthue > 1)
		exhausthue -= 1;
	var exhaustlength = (3 + getInt(9, getPivot('exhausthue'))) * size;
	
	for (var i = 0; i < count; i++) {
		for (var j = 0; j < exhaustlength; j++) {
			setPixel(x + dx2 * i * size * 1.5 + dx * i * spread * size + dx * (size + j) + dx2 * (size / 2 - 2),
						y + dy2 * i * size * 1.5 + dy * i * spread * size + dy * (size + j) + dy2 * (size / 2 - 2), getRGB(exhausthue, 1, 1), Math.pow(1.0 - (j / exhaustlength), 2.0));
			setPixel(x - dx2 * i * size * 1.5 + dx * i * spread * size + dx * (size + j) + dx2 * (size / 2 - 2),
						y - dy2 * i * size * 1.5 + dy * i * spread * size + dy * (size + j) + dy2 * (size / 2 - 2), getRGB(exhausthue, 1, 1), Math.pow(1.0 - (j / exhaustlength), 2.0));
			setPixel(x + dx2 * i * size * 1.5 + dx * i * spread * size + dx * (size + j) + dx2 * (-size / 2 + 2),
						y + dy2 * i * size * 1.5 + dy * i * spread * size + dy * (size + j) + dy2 * (-size / 2 + 2), getRGB(exhausthue, 1, 1), Math.pow(1.0 - (j / exhaustlength), 2.0));
			setPixel(x - dx2 * i * size * 1.5 + dx * i * spread * size + dx * (size + j) + dx2 * (-size / 2 + 2),
						y - dy2 * i * size * 1.5 + dy * i * spread * size + dy * (size + j) + dy2 * (-size / 2 + 2), getRGB(exhausthue, 1, 1), Math.pow(1.0 - (j / exhaustlength), 2.0));
		}
	}	
}

function drawSun(x, y, size) {
	ctx.fillStyle = "rgba(255,255,255,0.2)";
	ctx.beginPath();	
	ctx.arc(x,y,size * 1.1,0,2*Math.PI);
	ctx.fill();
	
	ctx.fillStyle = getColorString(getRGB(scene.skyhue, 0.2, 1));
	ctx.beginPath();	
	ctx.arc(x,y,size,0,2*Math.PI);
	ctx.fill();
}

function drawClouds() {
	scene.cloudstart = getFloat(getPivot('cloudstart'),0.5,0.8);
	scene.cloudfuzzyness = Math.pow(getFloat(getPivot('cloudfuzzyness')),2) * 0.4;
	for (var x = 0; x < width; x++) {
		for (var y = 0; y < Math.min(terrain1at(x), terrain2at(x)); y++) {
			setPixelRGB(x,y,255,255,255,simplex(x/400,Math.pow(y/150+1,1.5),5, scene.cloudstart,scene.cloudstart + scene.cloudfuzzyness) * (0.1 + scene.cloudfuzzyness / 0.35));
		}
	}
}

function drawSky() {
	scene.skyhue = getFloat(getPivot('skyhue'));
	scene.skyhue2 = getFloat(getPivot('skyhue')) * 0.16;
	scene.skyvalue1 = getFloat(getPivot('skyvalue1'), 0.6, 0.85);
	scene.skyvalue2 = getFloat(getPivot('skyvalue2'), 0.6, 0.85);
	scene.skynoise = getFloat(getPivot('skynoise'), 0, 0.05) + 0.05;
	scene.skysat = getFloat(getPivot('skysat'), 0.7,0.9);
	scene.night = getBool(getPivot('night'));

	scene.terrainhue = scene.skyhue + 0.25 * (getInt(4, getPivot('terrainhue')));
	scene.grasshue = scene.skyhue + 0.25 * (getInt(4, getPivot('grasshue')));

	scene.showbumps = getInt(6, getPivot('showbumps')) == 0;
	scene.bumpwidth = 6 + getInt(15, getPivot('bumpwidth'));
	scene.bumpslope = 2 * (1 + getInt(7, getPivot('bumpslope')));
	scene.bumpheight = 0.1 + 0.15 * getFloat(getPivot('bumpheight'));
	scene.bumpthreshhold = getFloat(getPivot('bumpthreshhold'));

	scene.mountainheight = 1;

	if (scene.terrainhue > 1)
		scene.terrainhue -= 1;
	
	var depths = 4 + getInt(4,getPivot('terraindephts'));
	scene.noiseseed = getFloat(getPivot('noiseSeed')) * 100;
	scene.terrainnoise = getFloat(getPivot('terrainnoise'), 0, 0.03);

	//scene.night = false;

	if (scene.night) {
		scene.skyvalue1 -= 0.6;
		scene.skyvalue2 -= 0.4;
		scene.starcount = 100 + getInt(getPivot('starcount'),300);
	}

	// Sky
	for (var x = 0; x < width; x++) {
		for (var y = 0; y < Math.min(terrain1at(x), terrain2at(x)); y++) {
			ry = y / height;
			ry = ry + getFloat(1000000 + x * y + x + y, -scene.skynoise, scene.skynoise);
			setPixel(x,y,getRGB(scene.skyhue * ry + (1 - ry) * (scene.skyhue + scene.skyhue2), scene.skysat, scene.skyvalue1 * ry + (1 - ry) * scene.skyvalue2));
		}
	}
	
	// Stars
	if (scene.night) {
		for (var i = 0; i < scene.starcount; i++) {
			var x = getRGB(scene.skyhue, 0.2, 0.8);
			setPixel(getInt(width, 10000 + i), getInt(height, 10000 + i + scene.starcount), getRGB(scene.skyhue, 0.2, 0.8));
		}
		scene.brightstars = Math.max(0, getInt(20,getPivot('brightstars')) - 8);
		scene.starsize = 5 + getInt(15, getPivot('starsize'));
		for (var i = 0; i < scene.brightstars; i++) {
			drawBrightStar(getInt(width, 20000 + i), getInt(height, 30000 + i), scene.starsize);
		}
	}
	
	// Sun
	if (!scene.night) {
		applyBuffer();
		var maxsuns = 3;
		for (var i = 0; i < maxsuns; i++) {
			if (getInt(100, getPivot('checkstarship' + i)) < 30) {
				drawSun(getInt(width, getPivot('sunx'+i)), getInt(height / 2, getPivot('suny'+i)), getInt(30, getPivot('sunsize'+i)) + 10);
			}
		}
		setupBuffer();
	}
		
	// Clouds
	if (!scene.night) {
		drawClouds();
	}

	// Starships
	var maxstarships = 7;
	for (var i = 0; i < maxstarships; i++) {
		if (getInt(100, getPivot('checkstarship' + i)) < 10) {
			drawStarships(getInt(width, 897985676 + i), getInt(height / 2, 987686576 + i));
		}
	}
}

function terrain1color(x, y) {
	var miny = 1;
	for (var i = x - 10; i < x + 10; i++) {
		miny = Math.max(miny, terrain1at(i));
	}
	
	var p = y - miny - 8 - 10 + getInt(20, 12253464 + x + y + x * y * y * y);

	return getRGB(scene.terrainhue + getFloat(1000000 + x * y + x + y, -scene.terrainnoise, scene.terrainnoise), 0.25, (p < 0 ? 0.99 : 0.87) - (scene.night ? 0.8 : 0));
}

function terrain1at(x, igonrebumps) {
	var v = scene.mountainheight * simplex(x / 200, scene.noiseseed, 5, 0, 1) / 0.8;
	
	if (scene.showbumps && !igonrebumps) {
		for (var i = x - scene.bumpwidth / 2; i < x + scene.bumpwidth / 2; i++) {
			if (simplex(i / 5, scene.noiseseed, 5) > 0.7 + 0.1 * scene.bumpthreshhold) {
				var terrainatpeakcenter = simplex(i / 200, scene.noiseseed, 5, 0, 1);
				v = Math.max(v, Math.min(terrainatpeakcenter + scene.bumpheight, 1) * (1.0 - Math.pow(Math.sin((x - i) / (scene.bumpwidth / 2) * (3.1415 / 2)),scene.bumpslope)));
			}
		}
	}

	return height * (1 - 0.5 * v);
}

function terrain2at(x) {
	return height * (0.75 + 0.25 * (1 - simplex(x / 600, scene.noiseseed + 100, 4, 0, 1) - 0.3 * Math.pow((x - width / 2) / (width / 2), 2)));	
}

function drawWater() {
	scene.waterhue = scene.skyhue + 0.25 * (getInt(4, getPivot('terrainhue')));
	
	var wx = 0;
	for (var i = 0; i < width; i++) {
		if (terrain2at(i) > terrain2at(wx)) {
			wx = i;
		}
	}

	var wy = terrain2at(wx);
	var waterangle = 1 + 1.0 * getFloat(getPivot('waterangle'));
	var coast = getInt(20, getPivot('coast')) + 20;
	var coastp = getInt(100, getPivot('coastp')) / 10;

	for (var y = wy; y < height; y++) {
		for (var x = wx - (y - wy) * waterangle - coast * simplex(y / 10, coastp, 4, 0, 1); x < wx + (y - wy) * waterangle + coast * simplex(y / 10, coastp + 42, 4, 0, 1); x++) {
			if (y >= terrain2at(x)) {
				var brightness = 0.6;

				var rx = Math.floor(Math.min(Math.max(0,x + 8 * Math.sin(y / 6 * 2 * 3.14159)),width - 1));
				var ry = Math.floor(wy - 2*(y - wy));

				setPixelRGB(x,y,Math.floor(buffer[(ry * width + rx) * 4 + 0] * brightness), Math.floor(buffer[(ry * width + rx) * 4 + 1] * brightness), Math.floor(buffer[(ry * width + rx) * 4 + 2] * brightness),1);
				setPixel(x,y,getRGB(scene.waterhue, 0.9, scene.night ? 0.3 : 0.5), 0.7);
			}
		}
	}
}

function drawTerrain() {
	// Terrain 1
	for (var x = 0; x < width; x++) {
		for (var y = terrain1at(x); y < terrain2at(x); y++) {
			setPixel(x, y, terrain1color(x,y), 1.0);
		}
	}

	// Base
	var maxbases = 4;
	for (var i = 0; i < maxbases; i++) {
		if (getInt(100, getPivot('checkbase' + i)) < 15) {
			drawBase();
		}
	}

	// Terrain 2
	for (var x = 0; x < width; x++) {
		for (var y = terrain2at(x); y < height; y++) {
			setPixel(x, y, getRGB(scene.terrainhue, 0.35, scene.night ? 0.12 : 0.75), 1.0);
		}
	}

	// Grass
	scene.grasssize = getInt(50, getPivot('grasssize')) + 70;
	scene.grassstretchiness = getInt(40, getPivot('grassstretchiness')) + 5;

	for (var x = 0; x < width; x++) {
		for (var y = terrain2at(x) - 2; y < height; y++) {
			setPixel(x, y, getRGB(scene.grasshue, 0.8, scene.night ? 0.2 : 1.0), simplex(x / scene.grasssize, (y - height * 0.25 * (1 - simplex(x / 600, scene.noiseseed + 100, 4, 0, 1))) / scene.grassstretchiness, 3, 0.57, 0.6));
		}
	}

	// Water
	drawWater();	
}

function drawBase() {
	var x0 = 60 + getInt(width - 120, getPivot('basex'));
	var d = 50;
	var highest = height;
	var x = 0;
	for (var i = x0 - d; i < x0 + d; i++) {
		if (terrain1at(i) < highest) {
			highest = terrain1at(i, true);
			x = i;
		}
	}

	var y = terrain1at(x, true);
	var color = terrain1color(x, y);

	var bwidth = 55;
	for (var i = x - bwidth / 2; i < x + bwidth / 2; i++) {
		for (var j = y - 5; j < Math.min(height, y - 5 + Math.pow((i - x) / bwidth * 6, -2)); j++) {
			setPixel(i, j, terrain1color(i, j));
		}
	}

	applyBuffer();
	
	ctx.beginPath();
	ctx.strokeStyle = getColorString(terrain1color(x,y));
	ctx.moveTo(x,y + 5);
	ctx.lineTo(x - bwidth / 3, y - 5);
	ctx.stroke();
	ctx.moveTo(x,y + 5);
	ctx.lineTo(x + bwidth / 3, y - 5);
	ctx.stroke();

	if (getInt(3, getPivot('hasbuilding')) == 0) {
		ctx.fillStyle = getColorString(terrain1color(x,y));
		ctx.fillRect(x - 4 + getInt(8, getPivot('buildingoffset')), y - 8 - 5, 3 + getInt(12, getPivot('buildingwidth')), 8);
	}

	setupBuffer();
}

function draw() {
	setupCanvas();
	setupBuffer();

	drawSky();
	drawTerrain();
	
	applyBuffer();

	var image = new Image();
	image.id = "pic"
	image.src = canvas.toDataURL();
	document.getElementById('proceduralArt').appendChild(image);
}

draw();