import React, { useRef, useEffect, useState } from 'react';
import { createFeedback } from '../services/api';

const CameraFeedPython = ({ onGestureDetected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [gestureCooldown, setGestureCooldown] = useState(false);
  const [error, setError] = useState(null);
  const [lastGesture, setLastGesture] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const detectGesture = async () => {
    if (!videoRef.current || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Capture frame from video
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      ctx.drawImage(videoRef.current, 0, 0);
      const frameData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Send to Python backend for gesture detection
      const response = await fetch('http://localhost:8000/detect-gesture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ frame_data: frameData }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        throw new Error('Invalid response from server');
      }
      
      // Update debug info with more detailed information
      if (result.hands_detected) {
        if (result.debug_info && Object.keys(result.debug_info).length > 0) {
          const { thumb_extension, thumb_to_fingers_y, thumb_to_wrist_y, is_thumb_extended } = result.debug_info;
          const safeThumbExt = thumb_extension !== undefined ? thumb_extension.toFixed(3) : 'N/A';
          const safeRelY = thumb_to_fingers_y !== undefined ? thumb_to_fingers_y.toFixed(3) : 'N/A';
          const safeWristY = thumb_to_wrist_y !== undefined ? thumb_to_wrist_y.toFixed(3) : 'N/A';
          const safeExtended = is_thumb_extended !== undefined ? (is_thumb_extended ? 'YES' : 'NO') : 'N/A';
          
          setDebugInfo(
            `Ext: ${safeThumbExt} | RelY: ${safeRelY} | ` +
            `WristY: ${safeWristY} | Extended: ${safeExtended} | ` +
            `${result.gesture || 'None'}`
          );
        } else {
          setDebugInfo(`Hands detected but no debug info | ${result.gesture || 'None'}`);
        }
      } else {
        setDebugInfo(result.error || 'No hands detected - Try better lighting/positioning');
      }
      
      // Handle detected gesture
      if (result.gesture && !gestureCooldown && result.gesture !== lastGesture) {
        setGestureCooldown(true);
        setLastGesture(result.gesture);
        await handleGesture(result.gesture);
        
        // Reset cooldown after 3 seconds
        setTimeout(() => {
          setGestureCooldown(false);
          setLastGesture('');
        }, 3000);
      }
      
    } catch (error) {
      console.error('Error detecting gesture:', error);
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setDebugInfo('Backend not running - Start Python server first');
      } else if (error.message.includes('Invalid response')) {
        setDebugInfo('Backend serialization error - Restart Python server');
      } else {
        setDebugInfo('Error: ' + error.message);
      }
    } finally {
      setIsProcessing(false);
    }
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
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: 'user'
          }
        });
        
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraStarted(true);
        };
        
        // Start gesture detection loop
        const detectionInterval = setInterval(detectGesture, 200); // Process every 200ms
        
        return () => {
          clearInterval(detectionInterval);
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
        };
        
      } catch (error) {
        console.error('Error starting camera:', error);
        setError('Failed to access camera. Please make sure you have granted camera permissions.');
      }
    };

    const cleanup = startCamera();
    
    return () => {
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, []);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-auto"
        style={{ display: cameraStarted ? 'block' : 'none' }}
        autoPlay
        muted
        playsInline
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            Starting camera...
          </div>
        </div>
      )}
      
      {/* Debug Information */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded text-sm">
        {debugInfo}
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm animate-pulse">
          Processing...
        </div>
      )}

      {/* Gesture Status */}
      {gestureCooldown && (
        <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm animate-pulse">
          Gesture Detected - Cooldown Active
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-16 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded text-sm">
        <div className="font-bold mb-1">Python MediaPipe Detection:</div>
        <div>👍 Thumbs UP = Positive feedback</div>
        <div>👎 Thumbs DOWN = Negative feedback</div>
        <div className="text-xs mt-1">
          <div>• Keep other fingers closed</div>
          <div>• Extend thumb clearly</div>
          <div>• Good lighting helps</div>
          <div>• Processing every 200ms</div>
        </div>
      </div>
    </div>
  );
};

export default CameraFeedPython;
