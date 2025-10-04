import React, { useRef, useEffect, useState } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { Hands } from '@mediapipe/hands';
import { DrawingUtils } from '@mediapipe/drawing_utils';
import { createFeedback } from '../services/api';

const CameraFeed = ({ onGestureDetected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [gestureCooldown, setGestureCooldown] = useState(false);
  const [error, setError] = useState(null);
  const [lastGesture, setLastGesture] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  const onResults = async (results) => {
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');
    const drawingUtils = new DrawingUtils(canvasCtx);

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        drawingUtils.drawConnectors(landmarks, Hands.CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
        drawingUtils.drawLandmarks(landmarks, { color: '#FF0000', lineWidth: 2, radius: 3 });

        // Highlight thumb landmarks for debugging
        const thumbTip = landmarks[4];
        const thumbIP = landmarks[3];
        const thumbMCP = landmarks[2];
        
        // Draw thumb landmarks with different colors
        drawingUtils.drawLandmarks([thumbTip], { color: '#FFFF00', lineWidth: 3, radius: 5 });
        drawingUtils.drawLandmarks([thumbIP], { color: '#FF8800', lineWidth: 3, radius: 4 });
        drawingUtils.drawLandmarks([thumbMCP], { color: '#FF0088', lineWidth: 3, radius: 4 });

        // Detect thumb gestures
        const gesture = detectThumbGesture(landmarks);
        
        // Update debug info with more detailed information
        if (landmarks.length > 0) {
          const thumbTip = landmarks[4];
          const thumbIP = landmarks[3];
          const thumbMCP = landmarks[2];
          const indexTip = landmarks[8];
          const middleTip = landmarks[12];
          const ringTip = landmarks[16];
          const pinkyTip = landmarks[20];
          const wrist = landmarks[0];
          
          const thumbExtension = Math.sqrt(
            Math.pow(thumbTip.x - thumbMCP.x, 2) + 
            Math.pow(thumbTip.y - thumbMCP.y, 2)
          );
          
          const thumbIPExtension = Math.sqrt(
            Math.pow(thumbIP.x - thumbMCP.x, 2) + 
            Math.pow(thumbIP.y - thumbMCP.y, 2)
          );
          
          const avgFingerTipY = (indexTip.y + middleTip.y + ringTip.y + pinkyTip.y) / 4;
          const thumbToFingersY = thumbTip.y - avgFingerTipY;
          const thumbToWristY = thumbTip.y - wrist.y;
          
          const isThumbExtended = thumbExtension > 0.03 || thumbIPExtension > 0.02;
          
          setDebugInfo(
            `Ext: ${thumbExtension.toFixed(3)} | IP: ${thumbIPExtension.toFixed(3)} | ` +
            `RelY: ${thumbToFingersY.toFixed(3)} | WristY: ${thumbToWristY.toFixed(3)} | ` +
            `Extended: ${isThumbExtended ? 'YES' : 'NO'} | ${gesture || 'None'}`
          );
        }

        if (gesture && !gestureCooldown && gesture !== lastGesture) {
          setGestureCooldown(true);
          setLastGesture(gesture);
          await handleGesture(gesture);
          
          // Reset cooldown after 3 seconds
          setTimeout(() => {
            setGestureCooldown(false);
            setLastGesture('');
          }, 3000);
        }
      }
    } else {
      setDebugInfo('No hands detected');
    }

    canvasCtx.restore();
  };

  const detectThumbGesture = (landmarks) => {
    // MediaPipe hand landmarks:
    // 0: wrist, 1: thumb_cmc, 2: thumb_mcp, 3: thumb_ip, 4: thumb_tip
    // 5: index_finger_mcp, 6: index_finger_pip, 7: index_finger_dip, 8: index_finger_tip
    // 9: middle_finger_mcp, 10: middle_finger_pip, 11: middle_finger_dip, 12: middle_finger_tip
    // 13: ring_finger_mcp, 14: ring_finger_pip, 15: ring_finger_dip, 16: ring_finger_tip
    // 17: pinky_mcp, 18: pinky_pip, 19: pinky_dip, 20: pinky_tip

    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    const thumbMCP = landmarks[2];
    const thumbCMC = landmarks[1];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const indexMCP = landmarks[5];
    const middleMCP = landmarks[9];
    const ringMCP = landmarks[13];
    const pinkyMCP = landmarks[17];

    // Method 1: Check if thumb is extended (distance from thumb MCP to tip)
    const thumbExtension = Math.sqrt(
      Math.pow(thumbTip.x - thumbMCP.x, 2) + 
      Math.pow(thumbTip.y - thumbMCP.y, 2)
    );

    // Method 2: Check if thumb IP joint is extended (more reliable)
    const thumbIPExtension = Math.sqrt(
      Math.pow(thumbIP.x - thumbMCP.x, 2) + 
      Math.pow(thumbIP.y - thumbMCP.y, 2)
    );

    // Method 3: Check thumb angle relative to hand
    const thumbAngle = Math.atan2(thumbTip.y - thumbMCP.y, thumbTip.x - thumbMCP.x) * (180 / Math.PI);
    const normalizedAngle = thumbAngle < 0 ? thumbAngle + 360 : thumbAngle;

    // Check if thumb is extended enough (more lenient threshold)
    const isThumbExtended = thumbExtension > 0.03 || thumbIPExtension > 0.02;

    if (!isThumbExtended) {
      return null; // Thumb not extended enough
    }

    // Method 4: Compare thumb tip position with other finger tips
    const avgFingerTipY = (indexTip.y + middleTip.y + ringTip.y + pinkyTip.y) / 4;
    const avgFingerTipX = (indexTip.x + middleTip.x + ringTip.x + pinkyTip.x) / 4;

    // Calculate distances for better detection
    const thumbToFingersY = thumbTip.y - avgFingerTipY;
    const thumbToFingersX = thumbTip.x - avgFingerTipX;

    // Method 5: Check if thumb is pointing up/down relative to wrist
    const wrist = landmarks[0];
    const thumbToWristY = thumbTip.y - wrist.y;
    const thumbToWristX = thumbTip.x - wrist.x;

    // Thumbs up detection: thumb tip is significantly above other fingers
    const thumbsUpCondition = (
      thumbToFingersY < -0.08 && // Thumb tip above other fingers
      thumbToWristY < -0.05 &&   // Thumb tip above wrist
      Math.abs(thumbToFingersX) < 0.15 // Thumb not too far left/right
    );

    // Thumbs down detection: thumb tip is significantly below other fingers
    const thumbsDownCondition = (
      thumbToFingersY > 0.08 &&  // Thumb tip below other fingers
      thumbToWristY > 0.05 &&    // Thumb tip below wrist
      Math.abs(thumbToFingersX) < 0.15 // Thumb not too far left/right
    );

    // Additional check: ensure other fingers are not extended (to avoid false positives)
    const otherFingersExtended = (
      Math.sqrt(Math.pow(indexTip.x - indexMCP.x, 2) + Math.pow(indexTip.y - indexMCP.y, 2)) > 0.08 ||
      Math.sqrt(Math.pow(middleTip.x - middleMCP.x, 2) + Math.pow(middleTip.y - middleMCP.y, 2)) > 0.08 ||
      Math.sqrt(Math.pow(ringTip.x - ringMCP.x, 2) + Math.pow(ringTip.y - ringMCP.y, 2)) > 0.08 ||
      Math.sqrt(Math.pow(pinkyTip.x - pinkyMCP.x, 2) + Math.pow(pinkyTip.y - pinkyMCP.y, 2)) > 0.08
    );

    // Only detect gesture if other fingers are mostly closed
    if (otherFingersExtended) {
      return null;
    }

    if (thumbsUpCondition) {
      return 'positive';
    } else if (thumbsDownCondition) {
      return 'negative';
    }

    return null;
  };

  const handleGesture = async (gesture) => {
        try {
          if (gesture === 'positive') {
            await createFeedback({ type: 'positive' });
            alert('✅ Positive feedback recorded!');
          }
          
          onGestureDetected(gesture);
        } catch (error) {
          console.error('Error handling gesture:', error);
          alert('❌ Failed to record feedback. Please try again.');
        }
  };

  useEffect(() => {
    const startCamera = async () => {
      try {
        const hands = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 1, // Focus on single hand for better accuracy
          modelComplexity: 1,
          minDetectionConfidence: 0.5, // Lowered for easier detection
          minTrackingConfidence: 0.5,  // Lowered for better tracking
          selfieMode: true // Better for front-facing camera
        });

        hands.onResults(onResults);
        handsRef.current = hands;

        const videoElement = videoRef.current;
        const camera = new Camera(videoElement, {
          onFrame: async () => {
            await hands.send({ image: videoElement });
          },
          width: 640,
          height: 480
        });

        camera.start();
        cameraRef.current = camera;
        setCameraStarted(true);
      } catch (error) {
        console.error('Error starting camera:', error);
        setError('Failed to access camera. Please make sure you have granted camera permissions.');
      }
    };

    startCamera();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };

  }, []);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-auto"
        style={{ display: cameraStarted ? 'block' : 'none' }}
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        width={640}
        height={480}
      />
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900 text-white text-lg">
          <div className="text-center">
            <div className="text-red-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      
      {!cameraStarted && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white text-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mv-auto mb-4"></div>
            Starting camera...
          </div>
        </div>
      )}
      
      {/* Debug Information */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded text-sm">
        {debugInfo}
      </div>

      {/* Gesture Status */}
      {gestureCooldown && (
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm animate-pulse">
          Gesture Detected - Cooldown Active
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded text-sm">
        <div className="font-bold mb-1">Instructions:</div>
        <div>👍 Thumbs UP = Positive feedback</div>
        <div>👎 Thumbs DOWN = Negative feedback</div>
        <div className="text-xs mt-1">
          <div>• Keep other fingers closed</div>
          <div>• Extend thumb clearly</div>
          <div>• Good lighting helps</div>
          <div>• Yellow dot = thumb tip</div>
        </div>
      </div>
    </div>
  );
};

export default CameraFeed;

