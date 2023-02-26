const { createCanvas, loadImage } = require("canvas")
const StackBlur = require('stackblur-canvas');

const fs = require("fs")

const ImageWidth = 1000
const ImageHeight = 1000

let canvas = createCanvas(ImageWidth, ImageHeight)
const canvasContext = canvas.getContext("2d")

const convertImageToCanvas = (img) => {
    xOffset = 60
    yOffset = 60
    const c = createCanvas(img.width + xOffset, img.height + yOffset)

    c.ctx = c.getContext("2d")
    c.ctx.drawImage(img, xOffset / 2, yOffset / 2)

    return c;
}

const colorImage = (imgCanvas, R, G, B) => {
    const imageData = imgCanvas.ctx.getImageData(0, 0, imgCanvas.width, imgCanvas.height)
    const data = imageData.data

    for(let i = 0; i < data.length; i += 4){
        data[i] = R
        data[i + 1] = G
        data[i + 2] = B
    }

    imgCanvas.ctx.putImageData(imageData, 0, 0)

    return imgCanvas;  
}

const blurImage = (imgCanvas, radius) => {
    const imageData = imgCanvas.ctx.getImageData(0, 0, imgCanvas.width, imgCanvas.height)
    StackBlur.imageDataRGBA(imageData, 0, 0, imgCanvas.width, imgCanvas.height, radius, 20, 20)
    imgCanvas.ctx.putImageData(imageData, 0, 0)

    return imgCanvas;  
}

fs.readdir('./baseIcons', (err, files) => {
    if(err) throw new Error("Não possível abrir o diretório")

    files.forEach(file => {
        loadImage(`./baseIcons/${file}`).then(icon => {
            canvasContext.clearRect(0, 0, ImageWidth, ImageHeight)
            canvasContext.fillStyle = "#151422"
            canvasContext.fillRect(0, 0, ImageWidth, ImageHeight)

            const foregroundIconCanvas = convertImageToCanvas(icon)
            const backgroundIconCanvas = convertImageToCanvas(icon)
        
            const coloredForegroundIconCanvas = colorImage(foregroundIconCanvas, 255, 255, 255)
            const coloredBackgroundIconCanvas = colorImage(backgroundIconCanvas, 102, 0, 204)
            const bluredBackgroundImage = blurImage(coloredBackgroundIconCanvas, 30)
            
            const iconWidth = 700
            const iconHeight = 700
            const iconPosX = (ImageWidth - iconWidth) / 2
            const iconPosY = (ImageHeight - iconHeight) / 2
            
            canvasContext.drawImage(bluredBackgroundImage, iconPosX, iconPosY, iconWidth, iconHeight)
            canvasContext.drawImage(coloredForegroundIconCanvas, iconPosX, iconPosY, iconWidth, iconHeight)
        
            const imageFilBuffer = canvas.toBuffer("image/png")
            fs.writeFileSync(`./output/${file}`, imageFilBuffer)
        })
    })
})
