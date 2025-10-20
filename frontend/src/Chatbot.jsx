import { useState, useEffect } from 'react';

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
    { type: 'bot', text: 'Hello! I\'m your Geotextile Predictor Assistant. I\'ll help you estimate the geotextile type based on your input parameters. Let\'s begin!' }
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({});
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const value = parseFloat(input.trim());
    if (isNaN(value) || value <= 0) {
      setMessages(prev => [...prev, { type: 'bot', text: 'Please enter a valid positive number.' }]);
      setInput('');
      return;
    }

    const param = parameters[currentStep];
    const newData = { ...data, [param.key]: value };
    setData(newData);
    setMessages(prev => [...prev, { type: 'user', text: input }]);
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
    setInput('');
  };

  const handleConfirmation = async (confirmation) => {
    if (confirmation.toLowerCase() === 'yes') {
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
          { type: 'bot', text: `Prediction Complete!\n🧵 Predicted Geotextile Type: ${result.predicted_type}\n📈 Confidence: ${result.confidence}%\n\nDescription:\n${result.description}\n\nWould you like to test another material? (yes/no)` }
        ]);
        setCurrentStep(currentStep + 1); // Move to restart step
      } catch (error) {
        console.error('Fetch error:', error);
        setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, there was an error processing your request. Please try again.' }]);
      }
      setIsLoading(false);
    } else if (confirmation.toLowerCase() === 'no') {
      // Restart
      setMessages([{ type: 'bot', text: 'Hello! I\'m your Geotextile Predictor Assistant. I\'ll help you estimate the geotextile type based on your input parameters. Let\'s begin!' }]);
      setCurrentStep(0);
      setData({});
    } else {
      setMessages(prev => [...prev, { type: 'bot', text: 'Please reply with "yes" or "no".' }]);
    }
    setInput('');
  };

  const handleRestart = (restart) => {
    if (restart.toLowerCase() === 'yes') {
      setMessages([{ type: 'bot', text: 'Hello! I\'m your Geotextile Predictor Assistant. I\'ll help you estimate the geotextile type based on your input parameters. Let\'s begin!' }]);
      setCurrentStep(0);
      setData({});
    } else if (restart.toLowerCase() === 'no') {
      setMessages(prev => [...prev, { type: 'bot', text: 'Thank you for using the Geotextile Predictor!' }]);
    } else {
      setMessages(prev => [...prev, { type: 'bot', text: 'Please reply with "yes" or "no".' }]);
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 text-center shadow-lg">
        <h1 className="text-2xl font-bold">🧵 Geotextile Type Predictor</h1>
        <p className="text-sm opacity-90">AI-Powered Material Classification</p>
      </div>
      <div id="chat-container" className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-blue-50 to-indigo-50">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md ${
              msg.type === 'user'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
            }`}>
              <div className="whitespace-pre-line text-sm leading-relaxed">
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-bl-md shadow-md border border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Processing your request...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {currentStep === parameters.length ? (
        <div className="p-4 bg-white border-t border-gray-200 shadow-lg">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleConfirmation('yes')}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200 shadow-lg transform hover:scale-105"
              disabled={isLoading}
            >
              ✅ Yes, Predict!
            </button>
            <button
              onClick={() => handleConfirmation('no')}
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-200 shadow-lg transform hover:scale-105"
              disabled={isLoading}
            >
              ❌ No, Edit
            </button>
          </div>
        </div>
      ) : currentStep === parameters.length + 1 ? (
        <div className="p-4 bg-white border-t border-gray-200 shadow-lg">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleRestart('yes')}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-lg transform hover:scale-105"
              disabled={isLoading}
            >
              🔄 Test Another
            </button>
            <button
              onClick={() => handleRestart('no')}
              className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full hover:from-gray-600 hover:to-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-200 shadow-lg transform hover:scale-105"
              disabled={isLoading}
            >
              👋 Exit
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200 shadow-lg">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your response..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-lg transform hover:scale-105"
              disabled={isLoading}
            >
              📤 Send
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Chatbot;
