import { useState, useEffect } from 'react';

// --- Constants for enhanced depth and contrast ---
const GLOBAL_BG_COLOR = '#1A1A1A'; // Base Background (Chat Body)
const COMPONENT_BG_COLOR = '#3A3A3A'; // Component Surface (Bot Bubbles ONLY)

const LIGHT_TEXT_COLOR = '#E0E0E0'; // Off-white
const SUBTLE_TEXT_COLOR = '#888888'; // Grey
const MAROON_START_COLOR = '#6A1C2F'; // Deep maroon
const MAROON_END_COLOR = '#8C2D43'; // Brighter maroon

// Design Constants for shape and shadow
const BUBBLE_RADIUS = '22px';
const TAIL_RADIUS = '6px';
const SHADOW_LIGHT = '0 3px 10px rgba(0, 0, 0, 0.4)'; // Subtle lift
const SHADOW_DEEP = '0 8px 25px rgba(0, 0, 0, 0.6)'; // Prominent lift

const parameters = [
  { key: 'tensile_strength', label: 'Tensile Strength (kN/m)', prompt: 'What is the tensile strength? (e.g., 88.90)' },
  { key: 'puncture_resistance', label: 'Puncture Resistance (N)', prompt: 'Enter puncture resistance in Newtons (e.g., 1100)' },
  { key: 'permittivity', label: 'Permittivity (s⁻¹)', prompt: 'Enter the permittivity (flow rate, e.g., 1.25)' },
  { key: 'filtration_efficiency', label: 'Filtration Efficiency (%)', prompt: 'Enter filtration efficiency percentage (e.g., 94)' },
  { key: 'recycled_content', label: 'Recycled Content (%)', prompt: 'Enter recycled content percentage (e.g., 60)' },
  { key: 'biobased_content', label: 'Biobased Content (%)', prompt: 'Enter biobased content percentage (e.g., 0)' },
  { key: 'uv_strength', label: 'UV Strength Retained (% after 500h)', prompt: 'Enter UV strength retained percentage (e.g., 65)' },
  { key: 'material_cost', label: 'Material Cost (PHP/m²)', prompt: 'Enter material cost in PHP per square meter (e.g., 158)' },
  { key: 'installation_cost', label: 'Installation Cost (PHP/m²)', prompt: 'Enter installation cost in PHP per square meter (e.g., 76)' }
];

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! I\'m your Geotextile Predictor Assistant. I\'ll help you estimate the geotextile type based on your input parameters. Let\'s begin!' },
    { type: 'bot', text: parameters[0].prompt }
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({});
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingParam, setEditingParam] = useState(null);


  const handleSubmit = async (e, value = null) => {
    if (e) e.preventDefault();
    const userInput = value || input.trim().toLowerCase();
    if (!userInput.trim()) return;
    setMessages(prev => [...prev, { type: 'user', text: userInput }]);

    if (currentStep < parameters.length) {
      // Collecting parameters
      const value = parseFloat(userInput);
      if (isNaN(value) || value < 0) {
        setMessages(prev => [...prev, { type: 'bot', text: 'Please enter a valid non-negative number.' }]);
        setInput('');
        return;
      }

      const param = parameters[currentStep];
      const newData = { ...data, [param.key]: value };
      setData(newData);
      console.log('Current step:', currentStep, 'Data:', newData);

      if (currentStep < parameters.length - 1) {
        setCurrentStep(currentStep + 1);
        const nextParam = parameters[currentStep + 1];
        setMessages(prev => [...prev, { type: 'bot', text: nextParam.prompt }]);
      } else {
        // All parameters collected, confirm
        console.log('All parameters collected, moving to confirmation');
        setMessages(prev => [...prev, { type: 'bot', text: 'Here\'s what you entered:\n\n' + Object.entries(newData).map(([k, v]) => `${parameters.find(p => p.key === k).label}: ${v}`).join('\n') + '\n\nShould I proceed with prediction? (yes/no)' }]);
        setCurrentStep(currentStep + 1); // Move to confirmation step
      }
    } else if (currentStep === parameters.length) {
      // Confirmation step
      if (userInput === 'yes') {
        setIsLoading(true);
        console.log('Sending data to backend:', Object.values(data));
        try {
          const response = await fetch('http://localhost:8000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ features: Object.values(data) })
          });
          console.log('Response status:', response.status);
          const result = await response.json();
          console.log('Response data:', result);
          setMessages(prev => [...prev,
            { type: 'bot', text: `Prediction Complete!\n🧵 Predicted Geotextile Type: ${result.predicted_type}\n📈 Confidence: ${result.confidence}%\n\n${result.description}\n\nWould you like to test another material? (yes/no)` }
          ]);
          setCurrentStep(currentStep + 1); // Move to restart step
        } catch (error) {
          console.error('Fetch error:', error);
          setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, there was an error processing your request. Please try again.' }]);
        }
        setIsLoading(false);
      } else if (userInput === 'no') {
        // Ask to edit
        setMessages(prev => [...prev, { type: 'bot', text: 'Would you like to edit a parameter? (yes/no)' }]);
        setCurrentStep(parameters.length + 2); // Move to edit ask step
      } else {
        setMessages(prev => [...prev, { type: 'bot', text: 'Please reply with "yes" or "no".' }]);
      }
    } else if (currentStep === parameters.length + 2) {
      // Edit ask step
      if (userInput === 'yes') {
        const paramList = Object.entries(data).map(([k, v]) => `${parameters.find(p => p.key === k).label}: ${v}`).join('\n');
        setMessages(prev => [...prev, { type: 'bot', text: `Which parameter would you like to edit?\n\n${paramList}\n\nPlease type the parameter name (e.g., "Tensile Strength").` }]);
        setCurrentStep(currentStep + 1); // Move to edit select step
      } else if (userInput === 'no') {
        setMessages(prev => [...prev, { type: 'bot', text: 'Let\'s start over. What is the tensile strength? (e.g., 88.90)' }]);
        setCurrentStep(0);
        setData({});
      } else {
        setMessages(prev => [...prev, { type: 'bot', text: 'Please reply with "yes" or "no".' }]);
      }
    } else if (currentStep === parameters.length + 3) {
      // Edit select step
      const param = parameters.find(p => p.label.toLowerCase().includes(userInput.toLowerCase()));
      if (param) {
        setEditingParam(param.key);
        setMessages(prev => [...prev, { type: 'bot', text: param.prompt }]);
        setCurrentStep(parameters.length + 4); // Move to edit input step
      } else {
        setMessages(prev => [...prev, { type: 'bot', text: 'Parameter not found. Please try typing part of the parameter name (e.g., "tensile" for "Tensile Strength").' }]);
      }
    } else if (currentStep === parameters.length + 1) {
      // Restart step
      if (userInput === 'yes') {
        setCurrentStep(0);
        setData({});
        setMessages([
          { type: 'bot', text: 'Hello! I\'m your Geotextile Predictor Assistant. I\'ll help you estimate the geotextile type based on your input parameters. Let\'s begin!' },
          { type: 'bot', text: parameters[0].prompt }
        ]);
      } else if (userInput === 'no') {
        setMessages(prev => [...prev, { type: 'bot', text: 'Thank you for using the Geotextile Predictor! Goodbye.' }]);
      } else {
        setMessages(prev => [...prev, { type: 'bot', text: 'Please reply with "yes" or "no".' }]);
      }
    } else if (currentStep === parameters.length + 4) {
      // Edit input step
      const value = parseFloat(userInput);
      if (isNaN(value) || value < 0) {
        setMessages(prev => [...prev, { type: 'bot', text: 'Please enter a valid non-negative number.' }]);
        setInput('');
        return;
      }
      const newData = { ...data, [editingParam]: value };
      setData(newData);
      setEditingParam(null);
      setMessages(prev => [...prev, { type: 'bot', text: 'Parameter updated! Here\'s the updated data:\n\n' + Object.entries(newData).map(([k, v]) => `${parameters.find(p => p.key === k).label}: ${v}`).join('\n') + '\n\nShould I proceed with prediction? (yes/no)' }]);
      setCurrentStep(parameters.length); // Back to confirmation step
    }
    setInput('');
  };


  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);


  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: GLOBAL_BG_COLOR, color: LIGHT_TEXT_COLOR }}>
      {/* HEADER Component: Horizontal Layout, Sleek Padding, Gradient Background */}
      <div
        style={{
          backgroundImage: `linear-gradient(to right, ${MAROON_START_COLOR}, ${MAROON_END_COLOR})`,
          boxShadow: SHADOW_DEEP
        }}
        className="p-6 text-center flex items-center justify-center space-x-4" // Reduced padding, horizontal flow
      >
        {/* Logo */}
        <img
          src="/maroon.png"
          alt="Geotextile Predictor Logo"
          className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
          style={{ objectFit: 'cover', backgroundColor: 'white' }}
        />
        {/* Title/Subtitle Container */}
        <div className="text-left">
          <h1 className="text-3xl font-bold" style={{ color: LIGHT_TEXT_COLOR }}>Geotextile Predictor</h1>
          <p className="text-base opacity-80" style={{ color: LIGHT_TEXT_COLOR }}>AI-Powered Material Classification</p>
        </div>
      </div>
      {/* CHAT BODY: Fills space, retaining the base dark color */}
      <div id="chat-container" className="flex-1 overflow-y-auto p-6 space-y-6" style={{ backgroundColor: GLOBAL_BG_COLOR }}>
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              style={msg.type === 'user' ? {
                // Maroon Gradient for emphasis
                backgroundImage: `linear-gradient(to right, ${MAROON_START_COLOR}, ${MAROON_END_COLOR})`,
                borderRadius: BUBBLE_RADIUS, 
                borderBottomRightRadius: TAIL_RADIUS,
                color: LIGHT_TEXT_COLOR,
                boxShadow: SHADOW_DEEP 
              } : {
                // Dark Grey Background for layering effect
                backgroundColor: COMPONENT_BG_COLOR, 
                borderRadius: BUBBLE_RADIUS, 
                borderBottomLeftRadius: TAIL_RADIUS, 
                color: LIGHT_TEXT_COLOR,
                boxShadow: SHADOW_LIGHT 
              }}
              className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl px-5 py-4 text-md`}
            >
              <div className="whitespace-pre-line leading-relaxed" style={{ color: LIGHT_TEXT_COLOR }}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div 
              style={{backgroundColor: COMPONENT_BG_COLOR, borderRadius: BUBBLE_RADIUS, borderBottomLeftRadius: TAIL_RADIUS, boxShadow: SHADOW_LIGHT}} 
              className="px-5 py-4"
            >
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{borderColor: SUBTLE_TEXT_COLOR}}></div>
                <span className="text-sm" style={{color: LIGHT_TEXT_COLOR}}>Processing your request...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* INTERACTIVE INPUT/BUTTONS - Placed at the bottom without a wrapper box */}
      {currentStep === parameters.length || currentStep === parameters.length + 1 || currentStep === parameters.length + 2 ? (
        // Confirmation/Restart/Edit Ask steps (Buttons embedded in a bubble)
        <div className="flex justify-start p-4" style={{ backgroundColor: GLOBAL_BG_COLOR, boxShadow: 'none' }}>
          <div 
            style={{backgroundColor: COMPONENT_BG_COLOR, borderRadius: BUBBLE_RADIUS, borderBottomLeftRadius: TAIL_RADIUS, boxShadow: SHADOW_LIGHT}} 
            className="px-5 py-4 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
          >
            <div className="text-md leading-relaxed mb-3" style={{color: LIGHT_TEXT_COLOR}}>
              {currentStep === parameters.length ? 'Should I proceed with prediction?' : 
               currentStep === parameters.length + 1 ? 'Would you like to test another material?' : 
               'Would you like to edit a parameter?'}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleSubmit(null, 'yes')}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
                style={{ backgroundColor: MAROON_END_COLOR, boxShadow: SHADOW_LIGHT }}
                disabled={isLoading}
              >
                Yes
              </button>
              <button
                onClick={() => handleSubmit(null, 'no')}
                className="px-4 py-2 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
                style={{ backgroundColor: SUBTLE_TEXT_COLOR, color: COMPONENT_BG_COLOR, boxShadow: SHADOW_LIGHT }}
                disabled={isLoading}
              >
                No
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Standard Text Input (Input is NOT removed, but the "footer box" is visually gone)
        <div className="p-6 pt-0" style={{ backgroundColor: GLOBAL_BG_COLOR, boxShadow: 'none' }}>
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex justify-center">
              <div className="relative w-full max-w-sm md:max-w-md">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your response..."
                  style={{ 
                    backgroundImage: `linear-gradient(to right, ${MAROON_START_COLOR}, ${MAROON_END_COLOR})`,
                    borderRadius: '30px', 
                    color: LIGHT_TEXT_COLOR,
                    boxShadow: SHADOW_DEEP, // Prominent shadow is kept
                    padding: '1rem 4rem 1rem 1.5rem',
                    border: 'none',
                    fontSize: '1.05rem'
                  }}
                  className="w-full focus:outline-none focus:ring-4 transition-all duration-200 placeholder-subtle-text"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  style={{ backgroundColor: MAROON_START_COLOR, boxShadow: SHADOW_LIGHT }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 text-white rounded-full hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-white transition-all duration-200 flex items-center justify-center"
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;