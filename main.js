/*function processWithUI(callback) {
    let flag;
    flag = confirm('This action will take a lot of time.(Your browser might crash!)  Continue?');
    if (flag) {
        let hr = callback(ctx, img.width, img.height);
        genDownloadLink(renderCanvas.toDataURL('image/png'));
        if (hr < 0) {
            alert('failed');
        } else {
            alert('sucess');
        }
    }
    console.log('user decision： ' + flag);
}*/

function loadPic(url) {
    var renderCanvas = document.getElementById('renderCanvas');
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    console.log(img);
    var ctx = renderCanvas.getContext('2d');
    //ctx.imageSmoothingEnabled = false;


    img.onload = function () {

        let mainDiv = document.getElementById('main');
        let resizeRatio = Math.min(mainDiv.offsetWidth / img.width, mainDiv.offsetHeight / img.height);
        console.log(resizeRatio);

        if (resizeRatio > 1) {
            resizeRatio = 1;
        } else {
            alert("Your image is too big. Compression will happen!");
        }

        let canvasW = img.width * resizeRatio;
        let canvasH = img.height * resizeRatio;

        renderCanvas.setAttribute('width', canvasW);
        renderCanvas.setAttribute('height', canvasH);

        loadColorPicker(renderCanvas, canvasW, canvasH);
        var ctx = renderCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, canvasW, canvasH);

        var pushBtn = document.getElementById('push');
        pushBtn.onclick = function () {
            let flag;
            flag = confirm('This action will take a lot of time.(Your browser might crash!)  Continue?');
            if (flag) {
                let hr = processPic(ctx, canvasW, canvasH);
                genDownloadLink(renderCanvas.toDataURL('image/png'));
                if (hr < 0) {
                    alert('failed');
                } else {
                    alert('sucess');
                }
            }
            console.log('user decision： ' + flag);
        }
    };
}



function loadColorPicker(canvas, w, h) {
    var colorPicker = document.getElementById('colorPicker');
    var ctx = canvas.getContext('2d');
    w = Math.floor(w);
    h = Math.floor(h);

    function getMouse(event) {
        //unofficial way
        var x = event.layerX;
        var y = event.layerY;
        /*
        var x = event.clientX;
        var y = event.clientY;
        */
        if (x > canvas.offsetWidth && x - canvas.offsetLeft > 0) {
            x -= canvas.offsetLeft;
            y -= canvas.offsetTop;
        }
        return [x, y];
    }


    function pick(event) {
        var mouse = getMouse(event);
        var x = mouse[0];
        var y = mouse[1];
        var pixel = ctx.getImageData(x, y, 1, 1);
        var data = pixel.data;
        var rgbaTxt = 'rgba(' + data[0] + ',' + data[1] +
            ',' + data[2] + ',' + data[3] + ')';
        colorPicker.style.background = rgbaTxt;
        colorPicker.textContent = rgbaTxt + '    (' + x + ', ' + y + ')';
    }

    function cutSelected(event) {
        let flag = confirm('This action will take a lot of time.(Your browser might crash!)  Continue?');
        if (flag) {
            var mouse = getMouse(event);
            var x = mouse[0];
            var y = mouse[1];
            console.log('x: ' + x + '  y: ' + y);
            var pixel = ctx.getImageData(x, y, 1, 1);
            var imgData = ctx.getImageData(0, 0, w, h);
            var data = pixel.data;
            if (data[3] < 5) {
                return;
            }
            let r = data[0];
            let g = data[1];
            let b = data[2];
            let selection = new Array();

            let slider = document.getElementById('slide');

            selection.push(x + y * w);
            console.log(selection);
            let colorSensor = ColorDetector(r, g, b, slider.value);
            process(imgData, selection, colorSensor);
            ctx.putImageData(imgData, 0, 0);
        }
        console.log('user decision： ' + flag);

    }
    canvas.addEventListener('mousemove', pick);
    canvas.addEventListener('click', cutSelected);
}


function loadBtns() {
    var renderCanvas = document.getElementById('renderCanvas');
    var ctx = renderCanvas.getContext('2d');
    var loadingBtn = document.getElementById('load');
    loadingBtn.onclick = function () {
        urlString = document.getElementById('url').value;
        console.log(urlString);
        loadPic(urlString);
    }
    var saveBtn = document.getElementById('save');
    saveBtn.onclick = function () {
        genDownloadLink(renderCanvas.toDataURL('image/png'));
    }

}

function processPic(ctx, w, h) {
    let hr = 0;
    var imgData = ctx.getImageData(0, 0, w, h);
    var pixels = imgData.data;
    //process begin
    var list = new Array();
    //push the 4 corners
    list.push(0);
    list.push(pixels.length / 4);
    list.push(imgData.width - 1);
    list.push(pixels.length / 4 - imgData.width);
    //__DEBUG__
    console.log(list);
    var whiteDec = ColorDetector(255, 255, 255, 128);
    process(imgData, list, whiteDec);

    ctx.putImageData(imgData, 0, 0);
    return hr;
}

function process(imgData, list, certainColorDetector) {
    var item = 0;
    var grave = new Set();
    var pixels = imgData.data;
    var delta = [1, -1, imgData.width, imgData.width * (-1)];

    while (list.length > 0) {
        list = list.filter((ele, i, arr) => arr.indexOf(ele) == i); //unique
        item = list[0];
        //__DEBUG__
        //console.log(item);

        let similarity = certainColorDetector(pixels, item * 4);

        if (similarity > 0.9) {
            pixels[item * 4 + 3] = Math.floor((1 - similarity) * 255);
            if (similarity > 0.99) {
                pixels[item * 4] = 0;
                pixels[item * 4 + 1] = 0;
                pixels[item * 4 + 2] = 0;
                pixels[item * 4 + 3] = 0;
            }

            for (var i = 0; i < 4; i++) {
                let nextItem = item + delta[i];
                if (grave.has(nextItem)) {
                    continue;
                }
                if (nextItem < 0 || nextItem > pixels.length || nextItem === NaN || nextItem === undefined) {
                    grave.add(nextItem);
                    continue;
                }
                list.push(nextItem);
            }
        }
        grave.add(list.shift());
    }
}

//DOM actions
function genDownloadLink(link) {
    window.location.href = link;
}

//Color detection 
//normal way is desprated

//clojure way
function ColorDetector(cr, cg, cb, offset = -1) {
    if (offset < 0 || offset > 255) {
        offset = Math.round((cr + cg + cb) / 3) - 15; //15 = 16 - 1
    }
    cr -= offset;
    cg -= offset;
    cb -= offset;
    return function (array, i) {
        let r = array[i];
        let g = array[i + 1];
        let b = array[i + 2];
        if (r == cr && g == cg && b == cb) {
            return true;
        }
        r -= offset;
        g -= offset;
        b -= offset;
        return ((r * cr + g * cg + b * cb) / Math.sqrt(r * r + g * g + b * b) / Math.sqrt(cr * cr + cg * cg + cb * cb));
        /*
         *   a.b = |a|.|b|.cosα
         *   a<x1,y1>.b<x2,y2> = x1.x2 + y1*y2
         *   
         *   so, cosα =  (x1.x2 + y1*y2) / (|a|.|b|)
         */
    }
}

//////////////////////////////////////////////////////////////////
//Construction area
/*
function isBorder(ele, i, arr) {
    var delta = [1, -1, w, -w];
    var flag; //is border?
    for (let i = 0; i < 4 i++) {
        flag = flag || (arr.indexOf(ele + delta[i]) == -1);
    }
    return flag;
}

function drawSelection(imageSelection, mode, refresh) {
    var area = new Array();
    while (imageSelection.length > 0) {
        var item = imageSelection[0];
        area = area.concat(imageSelection.filter(isBorder));
        imageSelection = imageSelection.filter((ele, i, arr) => area.indexOf(ele) == -1);
    }
    var UI = document.getElementById('UICanvas');
    var UIctx = UI.getContext('2d');
    UIdata = UIctx.getImageData(0, 0, UI.offsetWidth, UI.offsetHeight);
    UIdata.data = UIdata.data.map(function (ele, i, arr) {
        if (area.indexOf(ele) == -1) {

        }
    });


}*/
