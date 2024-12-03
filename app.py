import os
import time
from flask import Flask, render_template, request, send_file, jsonify
from Video_summarizer import VideoSummarizer

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

API_KEY = os.getenv("API_KEY")

@app.route('/')
def landing():
    return render_template('landing.html')

@app.route('/app')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'video' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['video']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    video_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(video_path)

    video_duration = VideoSummarizer.get_video_duration(video_path)
    chunks = (video_duration // 30) + 1
    estimated_time = chunks * 15

    return jsonify({
        "video_name": file.filename,
        "estimated_time": estimated_time
    })

@app.route('/process', methods=['POST'])
def process_file():
    video_name = request.json['video_name']
    output_format = request.json['format']

    video_path = os.path.join(UPLOAD_FOLDER, video_name)
    output_file = os.path.join(OUTPUT_FOLDER, f"summary_{os.path.splitext(video_name)[0]}")

    summarizer = VideoSummarizer(API_KEY)
    summarizer.process_video(video_path, output_format, output_file)

    output_file_path = f"{output_file}.{'md' if output_format == 'markdown' else 'docx'}"

    return jsonify({"file_path": output_file_path})

@app.route('/download/<path:filename>')
def download_file(filename):
    return send_file(filename, as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True)