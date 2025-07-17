import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
  onCaptchaChange: (value: string) => void;
  error?: string;
  className?: string;
}

const Captcha: React.FC<CaptchaProps> = ({ 
  onVerify, 
  onCaptchaChange, 
  error, 
  className = '' 
}) => {
  const [captchaCode, setCaptchaCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate random captcha code
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setUserInput('');
    setIsVerified(false);
    onVerify(false);
    onCaptchaChange('');
    return result;
  };

  // Draw captcha on canvas
  const drawCaptcha = (code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some noise lines
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Add noise dots
    ctx.fillStyle = '#dee2e6';
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        1,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    // Draw captcha text
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw each character with slight variations
    const charWidth = canvas.width / code.length;
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const x = charWidth * i + charWidth / 2;
      const y = canvas.height / 2 + (Math.random() - 0.5) * 10;
      
      // Random color for each character
      const colors = ['#007bff', '#dc3545', '#28a745', '#ffc107', '#6f42c1'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      
      // Random rotation
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.5);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  };

  // Handle user input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);
    onCaptchaChange(value);
    
    // Check if input matches captcha
    const isValid = value.toLowerCase() === captchaCode.toLowerCase();
    setIsVerified(isValid);
    onVerify(isValid);
  };

  // Handle refresh captcha
  const handleRefresh = () => {
    const newCode = generateCaptcha();
    drawCaptcha(newCode);
  };

  // Initialize captcha on component mount
  useEffect(() => {
    const code = generateCaptcha();
    drawCaptcha(code);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redraw when captcha code changes
  useEffect(() => {
    if (captchaCode) {
      drawCaptcha(captchaCode);
    }
  }, [captchaCode]);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={150}
              height={50}
              className="border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          title="Refresh captcha"
        >
          <RefreshCw size={16} />
        </button>
      </div>
      
      <div className="space-y-1">
        <input
          type="text"
          placeholder="Enter captcha code"
          value={userInput}
          onChange={handleInputChange}
          className={`border rounded-md p-2 focus:outline-none focus:ring-2 w-full ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : isVerified
              ? 'border-green-500 focus:ring-green-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          autoComplete="off"
        />
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        {isVerified && (
          <div className="text-green-600 text-sm">✓ Captcha verified</div>
        )}
      </div>
    </div>
  );
};

export default Captcha;
