# FLARE-LLM setup and validation

## Status

The official research repository is cloned at `vendor/FLARE`, commit `7c8f76c788a01f9270a3badfd2eeab45a979c44a`. This is source preparation only: the model, dependencies and checkpoints are not installed, and no inference has been run. The current machine is an Apple M2 Pro with 16 GB unified memory; the published decoder invokes CUDA, and the supplied environment targets Linux. Use a Linux NVIDIA GPU to reproduce the authors' path before attempting a Mac port.

## What the feature does

The camera provides face and lip video, sampled at 25 FPS and prepared as aligned 96×96 videos. A dual-stream visual encoder feeds a trained adaptor and a Qwen 2.5 7B decoder with LoRA weights. The resulting transcription is the input to the rest of the proposed product. This is phrase-level visual speech recognition, not a ready-to-use webcam service. Its output should be editable; silent mouthing has not yet been validated.

The paper reports 13.2% WER on LRS3 for its best configuration and 34.3% WER on WildVSR; neither establishes webcam or silent-mouthing accuracy. WER is a benchmark error metric, not a probability of each word being correct.

## Release details and blockers

- The authors list the stage-3 large checkpoint as `pretrained_models/lipreading_exp_2_large_face_lip_s2/checkpoints/checkpoint_4_60000.pt` and say it contains LoRA and adaptor weights. The listed checkpoint host is https://huggingface.co/Anony94/FLARE-checkpoints; its contents could not be verified through the available browser. Availability, license, exact contents, and checkpoint compatibility remain unverified.
- The code initializes Qwen from `flare_llm/pretrain_models/QW2.5`, while the dataset tokenizer uses a separate hard-coded absolute path in `flare_llm/hubert_dataset.py`. The code comments specify Qwen 2.5 7B **base**. Both paths must be resolved consistently on the GPU machine.
- The training script references a separate pretrained visual encoder; whether the stage-3 checkpoint contains all inference-time encoder weights needs verification by inspecting the checkpoint and its loading behavior. Do not assume it is self-contained.
- `flare_llm/run_decode.sh` defaults to the **base** model and points to the authors' dataset. Its downstream script activates a specific conda environment, calls cluster `module` commands, uses GPU 1 and configures video-only modality. It is a benchmark decoder, not a general video upload endpoint.
- The environment file is a Linux-specific export with anonymized channels and locally installed `fairseq` / `fairseq-extension`; its exact reproducibility and version compatibility are not established. The demo TSV references dataset files rather than providing an independently verified input clip.
- The decoder expects dataset manifests and labels in addition to two aligned video streams. The exact handling of missing audio and labels during inference must be tested, not inferred from the manifest format.

## Next steps on an NVIDIA GPU

1. Confirm access to the stage-3 large checkpoint, any required visual encoder weights, and Qwen 2.5 7B base. Inspect checkpoint keys and configuration before assuming which weights must be downloaded separately. Confirm their licenses directly.
2. Create an isolated Linux environment, replace anonymized dependencies with compatible sources, and resolve the model and tokenizer paths. Do not treat the exported environment as a tested install recipe.
3. Reproduce the authors' video-only decoding on one known, properly prepared face/lip pair and capture the actual hypothesis and timings. Confirm no audio enters the model.
4. Reproduce the published alignment and cropping conventions for a consented webcam recording; convert to 25 FPS and test the same decoder on this new recording.
5. Only after a real transcript works, wrap the loaded model in a persistent service and measure preprocessing and inference separately. Keep raw text visible and measure WER on held-out silent clips.

24 GB VRAM is a planning starting point, not a measured requirement; verify actual memory usage on the chosen GPU. A separate LLM correction layer is optional and must be evaluated against the raw transcription.

Sources: [paper](https://arxiv.org/abs/2610.19559), [official repository](https://github.com/jxzhanggg/FLARE), [FLARE-LLM instructions](https://github.com/jxzhanggg/FLARE/blob/main/flare_llm/README.md).
