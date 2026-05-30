from pathlib import Path

from pydub import AudioSegment


def convert_to_whisper_format(input_path: Path) -> Path:
    """Convert any supported audio file to 16 kHz mono WAV (Whisper's expected input).

    Overwrites the file in-place and returns the same path.
    """
    audio = AudioSegment.from_file(str(input_path))
    audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)
    output_path = input_path.with_suffix(".wav")
    audio.export(str(output_path), format="wav")
    return output_path
