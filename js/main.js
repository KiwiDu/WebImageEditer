function processWithUI(ctx, callback, imgData) {
    let flag = confirm('This action will take a lot of time.(Your browser might crash!)  Continue?');
    /**__DEBUG__
    console.log(imgData);
    return;
    */

    if (flag) {
        let hr = callback(imgData, arguments[3], arguments[4]);

        if (hr < 0) {
            alert('failed');
        } else {
            alert('sucess');
        }
        ctx.putImageData(imgData, 0, 0);
    }

}

function loadPic(url) {
    var renderCanvas = document.getElementById('renderCanvas');

    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    var ctx = renderCanvas.getContext('2d');

    img.onload = () => {
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
        renderCanvas.cWidth = canvasW;
        renderCanvas.cHeight = canvasH;

        renderCanvas.setAttribute('width', canvasW);
        renderCanvas.setAttribute('height', canvasH);

        var ctx = renderCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, canvasW, canvasH);
        loadColorPicker(renderCanvas, canvasW, canvasH);
        loadBtns(canvasW, canvasH);
    };
}

function loadColorPicker(canvas, w, h) {
    var colorPicker = document.getElementById('colorPicker');
    var ctx = canvas.getContext('2d');
    w = Math.floor(w);
    h = Math.floor(h);
    var imgData = ctx.getImageData(0, 0, w, h);

    /*__DEBUG__
    console.log('\ninput:\n');
    console.log(imgData);
    console.log('\ninput over\n');
    alert('bp');
    */

    let data;

    function getMouse(event) {
        //unofficial way
        var x = event.layerX;
        var y = event.layerY;
        /**official but i don't know how to use
          *capablitiy is also unknown
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
        let mouse = getMouse(event);
        let x = mouse[0];
        let y = mouse[1];
        let pixel = ctx.getImageData(x, y, 1, 1);
        data = pixel.data;
        var rgbaTxt = 'rgba(' + data[0] + ',' + data[1] +
            ',' + data[2] + ',' + data[3] + ')';
        colorPicker.style.background = rgbaTxt;
        let shade = data.reduce((prev, cur, i, arr) => prev + cur);
        colorPicker.className = shade > 128 * 3 ? 'light' : 'dark';
        colorPicker.textContent = rgbaTxt + '    (x:  ' + x + ', y:  ' + y + ')';
    }

    function cutSelected(event) {
        let mouse = getMouse(event);
        let x = mouse[0];
        let y = mouse[1];
        var list = new Array();
        list.push(x + y * w);
        processWithUI(ctx, process, imgData,
            list, ColorDetector(data));
    }
    canvas.addEventListener('mousemove', pick);
    canvas.addEventListener('click', cutSelected);
}

function loadBtns(w, h) {
    var renderCanvas = document.getElementById('renderCanvas');
    var ctx = renderCanvas.getContext('2d');
    var imgData = ctx.getImageData(0, 0, w, h);

    var pushBtn = document.getElementById('push');

    pushBtn.onclick = () => processWithUI(ctx, processPic, imgData);
    var loadBtn = document.getElementById('load');
    loadBtn.onclick = function () {
        urlString = document.getElementById('url').value;
        console.log(urlString);
        loadPic(urlString);
    }
    var saveBtn = document.getElementById('save');
    saveBtn.onclick = function () {
        download(renderCanvas.toDataURL('image/png'));
    }
}

function processPic(imgData) {
    let hr = 0;
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
    return hr;
}
