import cv2
import os
import sys

def extract_frames():
    video_path = "Red_Nike_shoe_spinning_slowly_202605250321.mp4"
    if not os.path.exists(video_path):
        print(f"Error: Video file not found at {video_path}")
        sys.exit(1)
        
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"Total frames in video: {total_frames}")
    
    if total_frames < 100:
        print("Error: Video has less than 100 frames.")
        sys.exit(1)
        
    # We want exactly 100 frames
    num_frames_to_extract = 100
    indices = [int(i * (total_frames - 1) / (num_frames_to_extract - 1)) for i in range(num_frames_to_extract)]
    
    extracted_count = 0
    for idx, frame_idx in enumerate(indices):
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if not ret:
            print(f"Error: Failed to read frame at index {frame_idx}")
            continue
            
        # Get frame dimensions
        h, w = frame.shape[:2]
        
        # Optimize performance: Resize if larger than 800px to maintain 60fps smoothness and reduce size
        max_size = 800
        if w > max_size or h > max_size:
            scale = max_size / max(w, h)
            new_w, new_h = int(w * scale), int(h * scale)
            frame = cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_AREA)
            
        # Watermark removal: Create binary mask over the VEO logo area in the bottom-right corner
        # Bounding box is Y: 415-442, X: 740-792 for the final 800x450 frame
        import numpy as np
        mask = np.zeros(frame.shape[:2], dtype=np.uint8)
        mask[415:442, 740:792] = 255
        
        # Apply Telea's inpainting algorithm to seamlessly blend the watermark area with the background gradient
        frame = cv2.inpaint(frame, mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)
            
        filename = f"frame_{idx + 1:03d}.png"
        cv2.imwrite(filename, frame)
        extracted_count += 1
        
    cap.release()
    print(f"Successfully extracted {extracted_count} optimized frames in 'banner/' folder!")

if __name__ == "__main__":
    extract_frames()
