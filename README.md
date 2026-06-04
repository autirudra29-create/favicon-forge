# Favicon Forge

Favicon Forge is a free, local-first favicon generator. Upload one logo or image and generate the common website icon files used by browsers, Apple devices, and Progressive Web Apps.

Live site:

```text
https://oss-zh-helper.netlify.app
```

## Features

- Generate PNG icons in common sizes:
  - `favicon-16x16.png`
  - `favicon-32x32.png`
  - `favicon-48x48.png`
  - `apple-touch-icon.png`
  - `android-chrome-192x192.png`
  - `android-chrome-512x512.png`
- Choose transparent, white, or custom background color.
- Choose square, softly rounded, or circular icon shape.
- Adjust icon padding so logos do not touch the edge.
- Copy the required HTML `<link>` tags.
- Download `site.webmanifest`.
- Runs fully in the browser with no server upload.

## Privacy

Images are processed locally with the browser Canvas API. The app does not upload your image, call a paid API, or require login.

## Local Usage

Open `index.html` in a browser.

No build step is required.

## Deployment

The project is a static site and can be deployed for free on Netlify, GitHub Pages, Cloudflare Pages, or any static hosting service.

## Limitations

- The first version outputs PNG icons only.
- It does not generate `.ico` files.
- It does not preserve EXIF metadata.
- Animated images are treated as a single decoded image.

## Contributing

Useful contribution ideas:

- Add `.ico` export.
- Add ZIP download.
- Add more manifest options.
- Improve mobile layout.
- Add visual tests for generated icon sizes.

## License

MIT
