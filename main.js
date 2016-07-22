function loadPic(url) {
    var canvas = document.getElementById("canvas");

    var img = new Image();
    img.src = url;

    if (img.onload == undefined) { //__prama once__
        img.onload = function () {
            canvas.setAttribute("width", img.width);
            canvas.setAttribute("height", img.height);
            loadColorPicker(canvas, img.width, img.height);
            var ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0);

            var pushBtn = document.getElementById("push");
            pushBtn.onclick = function () {
                let flag;
                flag = confirm("This action will take a lot of time.(Your browser might crash!)  Continue?");
                if (flag) {
                    let hr = processPic(ctx, img.width, img.height);
                    genDownloadLink(canvas.toDataURL('image/png'));
                    if (hr < 0) {
                        alert("failed");
                    } else {
                        alert("sucess");
                    }
                }
                console.log("user decision： " + flag);
            }
        }
    };


}

function loadBtns() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var loadingBtn = document.getElementById("load");
    loadingBtn.onclick = function () {
        urlString = document.getElementById("url").value;
        console.log(urlString);
        loadPic(urlString);
    }
    var saveBtn = document.getElementById("save");
    saveBtn.onclick = function () {

        genDownloadLink(canvas.toDataURL('image/png'));
    }

}

function loadColorPicker(canvas, w, h) {
    var colorPicker = document.getElementById('colorPicker');
    var ctx = canvas.getContext('2d');

    function pick(event) {
        var x = event.layerX - canvas.offsetLeft;
        var y = event.layerY - canvas.offsetTop;
        var pixel = ctx.getImageData(x, y, 1, 1);
        var data = pixel.data;
        var rgbaTxt = 'rgba(' + data[0] + ',' + data[1] +
            ',' + data[2] + ',' + data[3] + ')';
        colorPicker.style.background = rgbaTxt;
        colorPicker.textContent = rgbaTxt;
    }

    function cutSelected(event) {
        var x = event.layerX - canvas.offsetLeft;
        var y = event.layerY - canvas.offsetTop;
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
        selection.push(x + y * w);
        let ccd = ColorDetector(r, g, b);
        console.log(ccd);
        process(imgData, selection, ccd);
        ctx.putImageData(imgData, 0, 0);
    }
    canvas.addEventListener('mousemove', pick);
    canvas.addEventListener('click', cutSelected);
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
    var whiteDec = ColorDetector(255, 255, 255);
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
        item = list[0];
        //__DEBUG__
        console.log(item);
        /*
            if (grave.has(item)) {
                list.shift();
                continue;
            }
            if (item < 0 || item > pixels.length || item === NaN || item === undefined) {
                grave.add(list.shift());
                continue;
            }
        */
        if (certainColorDetector(pixels, item * 4)) {
            //__DEBUG__
            console.log(true);
            pixels[item * 4] = 0;
            pixels[item * 4 + 1] = 0;
            pixels[item * 4 + 2] = 0;
            pixels[item * 4 + 3] = 0;
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
        } else {
            //__DEBUG__
            console.log(false);
        }

        grave.add(list.shift());
        list = new Set(list).toArray();
    }
}




//DOM actions
function genDownloadLink(link) {
    downloadLink = document.getElementById("down");
    downloadLink.setAttribute("href", link);
}

//Color detection 
//normal way (__to__ @149 __see__ clojure way)
function isWhite(array, i) {
    //fast mode
    if (array[i] == 255 && array[i + 1] == 255 && array[i + 2] == 255)
        return true;

    //accurate mode
    let offset = 240; //16,32,64,128,256    //256-16
    let whiteRGB = 255 - offset;
    //followings are after offset
    let r = array[i] - offset;
    let g = array[i + 1] - offset;
    let b = array[i + 2] - offset;
    let wr = whiteRGB;
    let wg = whiteRGB;
    let wb = whiteRGB;

    return ((r * wr + g * wg + b * wb) / Math.sqrt(r * r + g * g + b * b) / Math.sqrt(wr * wr + wg * wg + wb * wb)) > 0.999;
    /*
     *   a.b = |a|.|b|.cosα
     *   a<x1,y1>.b<x2,y2> = x1.x2 + y1*y2
     *   
     *   so, cosα =  (x1.x2 + y1*y2) / (|a|.|b|)
     */
}

function isColor(array, i, br, bg, bb, offset = -1) {
    //followings are after offset
    if (offset < 0 || offset > 255) {
        offset = Math.round((br + bg + bb) / 3) - 16;
    }
    let r = array[i] - offset;
    let g = array[i + 1] - offset;
    let b = array[i + 2] - offset;
    br -= offset;
    bg -= offset;
    bb -= offset;

    return ((r * br + g * bg + b * bb) / Math.sqrt(r * r + g * g + b * b) / Math.sqrt(br * br + bg * bg + bb * bb)) > 0.999;
    /*
     *   a.b = |a|.|b|.cosα
     *   a<x1,y1>.b<x2,y2> = x1.x2 + y1*y2
     *   
     *   so, cosα =  (x1.x2 + y1*y2) / (|a|.|b|)
     */
}


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
        return ((r * cr + g * cg + b * cb) / Math.sqrt(r * r + g * g + b * b) / Math.sqrt(cr * cr + cg * cg + cb * cb)) > 0.999;
        /*
         *   a.b = |a|.|b|.cosα
         *   a<x1,y1>.b<x2,y2> = x1.x2 + y1*y2
         *   
         *   so, cosα =  (x1.x2 + y1*y2) / (|a|.|b|)
         */
    }
}
