//Color detection 
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

//Color detection 
function ColorDetector(rgb, offset = -1) {
    let cr = rgb[0];
    let cg = rgb[1];
    let cb = rgb[2];
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

//FooldFill
function process(imgData, list, colorSensor) {
    var item = 0;
    var grave = new Set();
    var pixels = imgData.data;
    var delta = [1, -1, imgData.width, imgData.width * (-1)];

    while (list.length > 0) {
        item = list[0];
        //__DEBUG__
        //console.log(item);

        let similarity = colorSensor(pixels, item * 4);

        if (similarity > 0.85) {

            console.log(true);

            if (similarity > 0.9) {
                pixels[item * 4] = 0;
                pixels[item * 4 + 1] = 0;
                pixels[item * 4 + 2] = 0;
                pixels[item * 4 + 3] = 0;
            } else {
                let alpha = (1 - similarity) * 255;
                pixels[item * 4 + 3] = alpha < 16 ? 0 : alpha;
            }



            for (var i = 0; i < 4; i++) {
                let nextItem = item + delta[i];
                if (grave.has(nextItem) || list.indexOf(nextItem) != -1) {
                    continue;
                }
                if (nextItem < 0 || nextItem > pixels.length || nextItem === NaN || nextItem === undefined) {
                    grave.add(nextItem);
                    continue;
                }
                list.push(nextItem);
            }
        } else {
            console.log(false);
        }
        grave.add(list.shift());
    }
    return 1;
}
