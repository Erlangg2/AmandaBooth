import React, {
  useRef,
  useState,
  useEffect,
  useCallback
} from "react";

import Webcam from "react-webcam";

import {
  centerCol,
  row,
  buttonStyle,
  backBtn,
  frameThumb,
  canvasStyle,
  titleBar,
  webcamStyle
} from "./styles";

const frameOptions = [
  "/assets/frames/heart-frame.png",
  "/assets/frames/heart-frame-2.png",
  "/assets/frames/heart-frame-3.png",
  "/assets/frames/heart-frame-4.png",
];

const stickerOptions = [
  "/assets/stickers/leaf.png",
  "/assets/stickers/sparkles.png"
];

const SLOT_WIDTH = 953;
const SLOT_HEIGHT = 599;

const SLOTS = [
  { x: 123, y: 78 },
  { x: 123, y: 697 },
  { x: 123, y: 1286 },
  { x: 123, y: 1885 }
];

export default function PhotoBooth() {

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const frameImgRef = useRef(null);

  const [selectedFrame, setSelectedFrame] = useState(null);
  const [mode, setMode] = useState("photo");

  const [photos, setPhotos] = useState([]);
  const [photoCount, setPhotoCount] = useState(0);
  const [countdown, setCountdown] = useState(null);

  const [stickers, setStickers] = useState([]);

  const handleBack = () => {

    if (mode === "decorate") {

      setMode("photo");
      setStickers([]);

    } else {

      setSelectedFrame(null);
      setPhotos([]);
      setPhotoCount(0);
      setMode("photo");

    }
  };

  // =============================
  // DRAW CANVAS
  // =============================

  const drawCanvas = useCallback(() => {

    const canvas = canvasRef.current;

    if (!canvas || !frameImgRef.current) return;

    const ctx = canvas.getContext("2d");

    canvas.width = frameImgRef.current.width;
    canvas.height = frameImgRef.current.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    photos.forEach(p => {

      const slot = SLOTS[p.slotIndex];

      if (!slot) return;

      const img = p.img;

      const imgWidth = img.width;
      const imgHeight = img.height;

      const imgRatio = imgWidth / imgHeight;
      const slotRatio = SLOT_WIDTH / SLOT_HEIGHT;

      let drawWidth;
      let drawHeight;

      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > slotRatio) {

        drawHeight = SLOT_HEIGHT;
        drawWidth = drawHeight * imgRatio;

        offsetX = (drawWidth - SLOT_WIDTH) / 2;

      } else {

        drawWidth = SLOT_WIDTH;
        drawHeight = drawWidth / imgRatio;

        offsetY = (drawHeight - SLOT_HEIGHT) / 2;
      }

      ctx.save();

      ctx.beginPath();

      ctx.rect(
        slot.x,
        slot.y,
        SLOT_WIDTH,
        SLOT_HEIGHT
      );

      ctx.clip();

      ctx.drawImage(
        img,
        slot.x - offsetX,
        slot.y - offsetY,
        drawWidth,
        drawHeight
      );

      ctx.restore();

    });

    ctx.drawImage(frameImgRef.current, 0, 0);

    stickers.forEach(s => {

      ctx.drawImage(
        s.img,
        s.x,
        s.y,
        120,
        120
      );

    });

  }, [photos, stickers]);

  useEffect(() => {

    if (!selectedFrame) return;

    const img = new Image();

    img.src = selectedFrame;

    img.onload = () => {

      frameImgRef.current = img;

      drawCanvas();

    };

  }, [selectedFrame, drawCanvas]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // =============================
  // TAKE PHOTO
  // =============================

  const takePhoto = () => {

    const src = webcamRef.current.getScreenshot();

    if (!src) return;

    const originalImg = new Image();

    originalImg.src = src;

    originalImg.onload = () => {

      const tempCanvas =
        document.createElement("canvas");

      const tempCtx =
        tempCanvas.getContext("2d");

      tempCanvas.width = originalImg.width;
      tempCanvas.height = originalImg.height;

      tempCtx.translate(tempCanvas.width, 0);
      tempCtx.scale(-1, 1);

      tempCtx.drawImage(
        originalImg,
        0,
        0,
        tempCanvas.width,
        tempCanvas.height
      );

      const fixedImg = new Image();

      fixedImg.src =
        tempCanvas.toDataURL("image/png");

      fixedImg.onload = () => {

        setPhotos(p => [
          ...p,
          {
            img: fixedImg,
            slotIndex: photoCount
          }
        ]);

        setPhotoCount(c => {

          const next = c + 1;

          if (next === 4) {
            setMode("decorate");
          }

          return next;
        });

      };
    };
  };

  const capturePhoto = () => {

    setCountdown(3);

    let count = 3;

    const interval = setInterval(() => {

      count--;

      if (count === 0) {

        clearInterval(interval);

        setCountdown(null);

        takePhoto();

      } else {

        setCountdown(count);

      }

    }, 1000);
  };

  const uploadPhoto = e => {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {

      const img = new Image();

      img.src = reader.result;

      img.onload = () => {

        setPhotos(p => [
          ...p,
          {
            img,
            slotIndex: photoCount
          }
        ]);

        setPhotoCount(c => {

          const next = c + 1;

          if (next === 4) {
            setMode("decorate");
          }

          return next;
        });

      };
    };

    reader.readAsDataURL(file);
  };

  const redoLastPhoto = () => {

    if (!photos.length) return;

    setPhotos(p => p.slice(0, -1));

    setPhotoCount(c => Math.max(0, c - 1));
  };

  const addSticker = src => {

    const img = new Image();

    img.src = src;

    img.onload = () => {

      setStickers(s => [
        ...s,
        {
          img,
          x: 300,
          y: 100
        }
      ]);

    };
  };

  const downloadPhoto = () => {

    const a = document.createElement("a");

    a.href =
      canvasRef.current.toDataURL("image/png");

    a.download = "photobooth.png";

    a.click();
  };

  return (

    <div style={centerCol}>

      <div style={{
        position: "relative",
        width: "100%"
      }}>

        {selectedFrame && (
          <button
            style={backBtn}
            onClick={handleBack}
          >
            ← Back
          </button>
        )}

        <h1 style={titleBar}>

          {!selectedFrame
            ? "Select frame ✨"
            : mode === "photo"
              ? "Smile 📸"
              : "Decorate 💖"}

        </h1>

      </div>

      {!selectedFrame ? (

        <div style={{
          display: "flex",
          gap: 24
        }}>

          {frameOptions.map(src => {

            const isSelected =
              selectedFrame === src;

            return (

              <img
                key={src}
                src={src}
                alt="frame option"
                onClick={() => setSelectedFrame(src)}
                style={{
                  ...frameThumb,
                  transform: isSelected
                    ? "translateY(-10px) scale(1.06)"
                    : "translateY(0)"
                }}
              />

            );
          })}

        </div>

      ) : (

        <div style={row}>

          <div>

            {mode === "photo" && (

              <>

                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/png"
                  mirrored={false}
                  audio={false}
                  videoConstraints={{
                    facingMode: "user",
                    width: 1280,
                    height: 720
                  }}
                  style={webcamStyle}
                />

                {countdown && (
                  <h2 style={{
                    textAlign: "center"
                  }}>
                    {countdown}
                  </h2>
                )}

                <div style={{
                  display: "flex",
                  gap: 10
                }}>

                  <button
                    style={buttonStyle}
                    onClick={capturePhoto}
                  >
                    Take
                  </button>

                  <label style={buttonStyle}>

                    Upload

                    <input
                      type="file"
                      hidden
                      onChange={uploadPhoto}
                    />

                  </label>

                  <button
                    style={buttonStyle}
                    onClick={redoLastPhoto}
                  >
                    ⟳
                  </button>

                </div>

              </>

            )}

            {mode === "decorate" &&
              stickerOptions.map(src => (

                <img
                  key={src}
                  src={src}
                  alt="sticker"
                  onClick={() => addSticker(src)}
                  style={{
                    width: 50,
                    cursor: "pointer"
                  }}
                />

              ))
            }

          </div>

          <canvas
            ref={canvasRef}
            style={canvasStyle}
          />

          {(mode === "decorate" || photoCount >= 4) && (

            <button
              style={buttonStyle}
              onClick={downloadPhoto}
            >
              Download
            </button>

          )}

        </div>

      )}

    </div>
  );
}