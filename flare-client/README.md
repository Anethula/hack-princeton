# Hosted FLARE client

The hosted model reported ready during setup on November 14, 2026. A real clip has not yet been transcribed with these clients. No local GPU, model installation, or Python packages are required.

From the HackPrinceton workspace:

```sh
python3 flare-client/flare.py
python3 flare-client/flare.py /absolute/path/to/clip.mp4
```

Use a consented 2–5 second raw webcam recording, at most 8 seconds. MP4 or WebM; one face, front-facing and well lit. Do not crop or resize manually. For browser capture use `audio: false`. Uploading sends the video to the teammate's hosted service.

The tunnel is temporary. Override it without editing code:

```sh
python3 flare-client/flare.py --url https://NEW-HOST.trycloudflare.com /path/to/clip.webm
```

Alternatively set `FLARE_API_URL` for the Python client.

For an existing browser application:

```js
import { transcribeVideo } from './flare.mjs';
const result = await transcribeVideo(recordedBlob);
// Display result.text for review before submitting to Deep Agents.
```

The browser helper accepts an optional second argument for a replacement URL. Browser calls require the server to permit your origin through CORS. Python success does not prove browser success. Do not manually set multipart Content-Type. Do not retry timed-out uploads automatically: the GPU may still be processing them.

Check readiness once at session start. Transcription verifies a nonempty transcript and `audio_used: false`, without an extra readiness request. Clip duration is enforced by the server. Keep Start/Stop recording under 8 seconds, show processing state, and prevent duplicate submissions in your UI. These client helpers do not record video or execute agent actions; the local camera page below records video.

Next live check: upload a real clip, inspect transcript and timing, then test from the actual frontend origin. The guide reports a finite GPU allocation; reconfirm availability before a demo.

## Local camera app

```sh
cd /Users/arnav/Documents/Competitions/HackPrinceton
python3 flare-client/server.py
```

Open http://localhost:8000, choose Enable camera, grant permission, then Start. The backend must run on your Mac for this localhost URL to work there. Use `--port 8001` if necessary. No additional dependencies.

The browser captures audio-free 3–6 second MP4/WebM clips and sends raw video bodies to local `POST /api/transcribe`. The backend forwards multipart uploads using the existing FLARE client, validates responses, and removes temporary files. `GET /api/ready` proxies model readiness. The camera preview is mirrored; uploaded frames are not intentionally mirrored.

Continue recording mode captures the next phrase while the previous upload processes. Finish phrase submits early without disabling the camera. There is one in-flight request and at most two waiting clips. Capture pauses when the queue is full and resumes when space opens; watch the Recording/Catching up status. Clips remain separate phrases; automatic cut points can split words. Stop disables the camera and submits the final partial recording; a request already processing can still return its transcript. No transcript triggers agent execution.

Validation: the local backend returned the real transcript “set a reminder for tomorrow” from the supplied audio-free MP4, with `audio_used: false`. Python and browser script syntax checks passed. Live camera permissions and recording behavior still need browser testing. The tunnel and GPU allocation are temporary; update FLARE_API_URL before starting the server if they change. This server is intended for local development only, not public deployment.


## Latency improvements

Each result displays capture duration, queue wait, full browser request duration, start-to-text latency, upstream preprocessing/inference/server totals, local body receipt, and proxy timing. Proxy timing includes upstream request/upload and temporary-file handling; it is not a pure network measurement. On failure the session stops and unsent clips are discarded with a visible count. No automatic retry occurs. Use Check connection, then Start to resume. Stop submits the final partial clip and drains queued clips.

Restart the Python server and reload the browser after updating. Simulated queue tests: `node flare-client/tests/queue.cjs`. Actual webcam behavior and latency improvement still require a live browser test; no speedup has been measured for this revision.
