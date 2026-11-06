[object Object]
## 46. Locked public Labs detail presentation — 6 November 2026

**LOCKED — preserve this behavior unless explicitly changed by the owner.**

- A successful release build generates a poster from the exact compiled artifact. The generated poster remains the default visual for the public Labs gallery card and public project detail preview when no uploaded gallery asset is selected.
- An owner may upload an image, animated GIF, or video and explicitly publish it as the public gallery media. That selected media replaces the generated poster in both the gallery card and project detail preview. The public selection remains bound to the exact published artifact/source version. Private uploads and unpromoted uploads never appear publicly.
- GIFs must remain animated (unless reduced motion is requested); videos render muted, inline and looped in the visual preview. A video uses the generated still as its metadata poster when available.
- Media failure falls back to the generated poster, then to existing Labs artwork. The preview component is a non-executing media renderer.
- The public project detail page does not mount LabWorkspace, LabRuntimeBoundary, a published-artifact iframe, or a built-in executable runtime. It shows the title/header, selected static media preview, experiment explanation, and the existing authorized source-access section. Source access is a read-only source feature and is not an executable preview.
- LabWorkspace and runtime infrastructure remain in the repository for a future dedicated playground surface; this change only removes the executable workspace from the public detail page. Do not delete or change compiler/build/publish/artifact capture behavior.

### 46.1 Detail-page implementation

The public route src/app/labs/[slug]/page.js no longer imports or renders LabWorkspace. The media caption now reads "Project preview" rather than promising an interactive experiment below it. LabExperimentPreview remains the shared visual renderer for gallery cards, featured content and detail media.