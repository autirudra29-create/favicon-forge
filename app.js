const iconSpecs = [
  { filename: "favicon-16x16.png", size: 16, label: "Favicon 16" },
  { filename: "favicon-32x32.png", size: 32, label: "Favicon 32" },
  { filename: "favicon-48x48.png", size: 48, label: "Favicon 48" },
  { filename: "apple-touch-icon.png", size: 180, label: "Apple Touch Icon" },
  { filename: "android-chrome-192x192.png", size: 192, label: "Android Chrome 192" },
  { filename: "android-chrome-512x512.png", size: 512, label: "Android Chrome 512" }
];

const htmlSnippet = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;

const manifestObject = {
  name: "My Website",
  short_name: "Website",
  icons: [
    {
      src: "/android-chrome-192x192.png",
      sizes: "192x192",
      type: "image/png"
    },
    {
      src: "/android-chrome-512x512.png",
      sizes: "512x512",
      type: "image/png"
    }
  ],
  theme_color: "#ffffff",
  background_color: "#ffffff",
  display: "standalone"
};

const fileInput = document.querySelector("#fileInput");
const dropZone = document.querySelector("#dropZone");
const sourcePreview = document.querySelector("#sourcePreview");
const emptyPreview = document.querySelector("#emptyPreview");
const sourceMeta = document.querySelector("#sourceMeta");
const backgroundColor = document.querySelector("#backgroundColor");
const paddingRange = document.querySelector("#paddingRange");
const paddingValue = document.querySelector("#paddingValue");
const generateButton = document.querySelector("#generateButton");
const manifestButton = document.querySelector("#manifestButton");
const statusText = document.querySelector("#statusText");
const iconGrid = document.querySelector("#iconGrid");
const htmlCode = document.querySelector("#htmlCode");
const manifestCode = document.querySelector("#manifestCode");
const copyHtmlButton = document.querySelector("#copyHtmlButton");
const copyManifestButton = document.querySelector("#copyManifestButton");

let sourceImage = null;
let sourceFile = null;
let generatedIcons = [];
let manifestUrl = "";

htmlCode.textContent = htmlSnippet;
manifestCode.textContent = JSON.stringify(manifestObject, null, 2);
renderEmptyIcons();

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.classList.toggle("error", isError);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getRadioValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`).value;
}

function revokeGeneratedUrls() {
  generatedIcons.forEach((icon) => URL.revokeObjectURL(icon.url));
  generatedIcons = [];
  if (manifestUrl) {
    URL.revokeObjectURL(manifestUrl);
    manifestUrl = "";
  }
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
}

function drawIcon(size) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const backgroundMode = getRadioValue("backgroundMode");
  const cornerMode = getRadioValue("cornerMode");
  const paddingPercent = Number(paddingRange.value);
  const padding = Math.round(size * (paddingPercent / 100));
  const imageBox = size - padding * 2;

  canvas.width = size;
  canvas.height = size;
  ctx.clearRect(0, 0, size, size);

  if (cornerMode !== "none") {
    const radius = cornerMode === "circle" ? size / 2 : Math.round(size * 0.18);
    roundedRectPath(ctx, 0, 0, size, size, radius);
    ctx.clip();
  }

  if (backgroundMode !== "transparent") {
    ctx.fillStyle = backgroundMode === "white" ? "#ffffff" : backgroundColor.value;
    ctx.fillRect(0, 0, size, size);
  }

  const imageRatio = sourceImage.naturalWidth / sourceImage.naturalHeight;
  let drawWidth = imageBox;
  let drawHeight = imageBox;
  if (imageRatio > 1) {
    drawHeight = imageBox / imageRatio;
  } else {
    drawWidth = imageBox * imageRatio;
  }
  const drawX = (size - drawWidth) / 2;
  const drawY = (size - drawHeight) / 2;
  ctx.drawImage(sourceImage, drawX, drawY, drawWidth, drawHeight);

  return canvas;
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

async function generateIcons() {
  if (!sourceImage) {
    setStatus("Upload an image first.", true);
    return;
  }

  revokeGeneratedUrls();
  iconGrid.innerHTML = "";
  setStatus("Generating icons...");

  const icons = [];
  for (const spec of iconSpecs) {
    const canvas = drawIcon(spec.size);
    const blob = await canvasToBlob(canvas);
    const url = URL.createObjectURL(blob);
    icons.push({ ...spec, blob, url });
  }

  generatedIcons = icons;
  renderGeneratedIcons();
  createManifestDownload();
  setStatus(`Generated ${icons.length} PNG icons.`);
}

function renderEmptyIcons() {
  iconGrid.innerHTML = iconSpecs
    .map(
      (spec) => `<article class="icon-card">
        <div class="icon-preview"><span class="muted">${spec.size}x${spec.size}</span></div>
        <h3>${spec.label}</h3>
        <p>${spec.filename}</p>
        <button class="secondary-button" type="button" disabled>Waiting</button>
      </article>`
    )
    .join("");
}

function renderGeneratedIcons() {
  iconGrid.innerHTML = "";
  generatedIcons.forEach((icon) => {
    const card = document.createElement("article");
    card.className = "icon-card";
    card.innerHTML = `
      <div class="icon-preview"><img src="${icon.url}" alt="${icon.filename}"></div>
      <h3>${icon.label}</h3>
      <p>${icon.filename} - ${icon.size}x${icon.size} - ${formatBytes(icon.blob.size)}</p>
      <a href="${icon.url}" download="${icon.filename}">Download PNG</a>
    `;
    iconGrid.appendChild(card);
  });
}

function createManifestDownload() {
  const manifestText = JSON.stringify(manifestObject, null, 2);
  const manifestBlob = new Blob([manifestText], { type: "application/manifest+json" });
  manifestUrl = URL.createObjectURL(manifestBlob);
  manifestButton.disabled = false;
}

function downloadManifest() {
  if (!manifestUrl) return;
  const link = document.createElement("a");
  link.href = manifestUrl;
  link.download = "site.webmanifest";
  link.click();
}

function loadImageFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    setStatus("Choose a PNG, JPG, JPEG, or WebP image.", true);
    return;
  }

  revokeGeneratedUrls();
  renderEmptyIcons();
  manifestButton.disabled = true;
  sourceFile = file;

  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    sourceImage = image;
    sourcePreview.src = objectUrl;
    sourcePreview.style.display = "block";
    emptyPreview.style.display = "none";
    sourceMeta.textContent = `${file.name} - ${image.naturalWidth}x${image.naturalHeight} - ${formatBytes(file.size)}`;
    setStatus("Image loaded. Ready to generate icons.");
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    sourceImage = null;
    sourceFile = null;
    setStatus("Could not read this image. Try another file.", true);
  };
  image.src = objectUrl;
}

fileInput.addEventListener("change", (event) => {
  loadImageFile(event.target.files[0]);
});

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("dragging");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragging");
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("dragging");
  loadImageFile(event.dataTransfer.files[0]);
});

paddingRange.addEventListener("input", () => {
  paddingValue.textContent = `${paddingRange.value}%`;
});

generateButton.addEventListener("click", generateIcons);
manifestButton.addEventListener("click", downloadManifest);

copyHtmlButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(htmlSnippet);
  setStatus("HTML tags copied.");
});

copyManifestButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(JSON.stringify(manifestObject, null, 2));
  setStatus("Manifest copied.");
});
