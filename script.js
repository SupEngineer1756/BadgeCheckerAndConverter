// by HAMMADI RAFIK OUARIACHI
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

function isHappyColor(red, green, blue) {
    return (red >0 && green > 0 && blue <125);
}

async function checkBadge(inputImagePath){
    const inputImage = await loadImage(inputImagePath);

    const canvas = createCanvas(inputImage.width, inputImage.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(inputImage, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    if (canvas.width !== 512 || canvas.height !== 512) {
        console.log("Badge dimensions don't validate the 512x512 rule");
        return false;
    }
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const idx = (canvas.width * y + x) << 2;
            const red = data[idx];
            const green = data[idx + 1];
            const blue = data[idx + 2];
            const alpha = data[idx + 3];

            
            if (alpha === 0) {
                continue;
            }

            
            if ((x - centerX) ** 2 + (y - centerY) ** 2 > radius ** 2) {
                console.log("The Badge doesn't validate the no non-transparent pixels outside a circle rule");
                return false;
            }

            
            if (!isHappyColor(red, green, blue)) {
                console.log("The Badge doesn't validate the happy colors rule");
                return false;
            }
        }
    }

    console.log("Badge validates all rules");
    return true;
}
async function convertBadge(inputImagePath, outputImagePath) {

    const inputImage = await loadImage(inputImagePath);

    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(inputImage, 0, 0,512,512);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    

   
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {

            const idx = (canvas.width * y + x) << 2;
            const red = data[idx];
            const green = data[idx + 1];
            const blue = data[idx + 2];
            const alpha = data[idx + 3];

            if (alpha === 0) {
                continue;
            }

            if ((x - centerX) ** 2 + (y - centerY) ** 2 > radius ** 2) {
                data[idx + 3] = 0; 
            }

            if (!isHappyColor(red, green, blue)) {
                data[idx] = 255; 
                data[idx + 1] = 255; 
                data[idx + 2] = 0; 
            }
        }
    }

    
    ctx.putImageData(imageData, 0, 0);

    const out = fs.createWriteStream(outputImagePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () => console.log('The PNG output file was created.'));
}

checkBadge('input.png')
    .then((result) => {
        if (!result) {
            convertBadge('input.png', 'output.png');
        }
    })
    .catch((error) => {
        console.error("Error:", error);
    });
checkBadge('output.png')