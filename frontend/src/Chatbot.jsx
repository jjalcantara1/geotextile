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
    { type: 'bot', text: 'Hello! I\'m your Geotextile Predictor Assistant. I\'ll help you estimate the geotextile type based on your input parameters. Let\'s begin!' },
    { type: 'bot', text: parameters[0].prompt }
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({});
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = async (e, value = null) => {
    if (e) e.preventDefault();
    const userInput = value || input.trim().toLowerCase();
    if (!userInput.trim()) return;
    setMessages(prev => [...prev, { type: 'user', text: input }]);

    if (currentStep < parameters.length) {
      // Collecting parameters
      const value = parseFloat(userInput);
      if (isNaN(value) || value <= 0) {
        setMessages(prev => [...prev, { type: 'bot', text: 'Please enter a valid positive number.' }]);
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
            { type: 'bot', text: `Prediction Complete!\n🧵 Predicted Geotextile Type: ${result.predicted_type}\n📈 Confidence: ${result.confidence}%\n\nDescription:\n${result.description}\n\nWould you like to test another material? (yes/no)` }
          ]);
          setCurrentStep(currentStep + 1); // Move to restart step
        } catch (error) {
          console.error('Fetch error:', error);
          setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, there was an error processing your request. Please try again.' }]);
        }
        setIsLoading(false);
      } else if (userInput === 'no') {
        // Restart
        setMessages(prev => [...prev, { type: 'bot', text: 'Let\'s start over. What is the tensile strength? (e.g., 88.90)' }]);
        setCurrentStep(0);
        setData({});
      } else {
        setMessages(prev => [...prev, { type: 'bot', text: 'Please reply with "yes" or "no".' }]);
      }
    } else if (currentStep === parameters.length + 1) {
      // Restart step
      if (userInput === 'yes') {
        setMessages(prev => [...prev, { type: 'bot', text: 'Great! Let\'s start over. What is the tensile strength? (e.g., 88.90)' }]);
        setCurrentStep(0);
        setData({});
      } else if (userInput === 'no') {
        setMessages(prev => [...prev, { type: 'bot', text: 'Thank you for using the Geotextile Predictor!' }]);
      } else {
        setMessages(prev => [...prev, { type: 'bot', text: 'Please reply with "yes" or "no".' }]);
      }
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
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-gray-800 text-white p-4 text-center shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Geotextile Predictor</h1>
        <p className="text-sm opacity-90">AI-Powered Material Classification</p>
      </div>
      <div id="chat-container" className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-3 rounded-2xl shadow-md ${
              msg.type === 'user'
                ? 'bg-gray-700 text-white rounded-br-md'
                : 'bg-white text-gray-800 border border-gray-300 rounded-bl-md'
            }`}>
              <div className="whitespace-pre-line text-base md:text-lg lg:text-xl leading-relaxed">
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-bl-md shadow-md border border-gray-300">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span className="text-sm">Processing your request...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {currentStep === parameters.length ? (
        <div className="flex justify-start p-4">
          <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-bl-md shadow-md border border-gray-300 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
            <div className="text-base leading-relaxed mb-3">Should I proceed with prediction?</div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleSubmit(null, 'yes')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm"
                disabled={isLoading}
              >
                Yes
              </button>
              <button
                onClick={() => handleSubmit(null, 'no')}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 shadow-sm"
                disabled={isLoading}
              >
                No
              </button>
            </div>
          </div>
        </div>
      ) : currentStep === parameters.length + 1 ? (
        <div className="flex justify-start p-4">
          <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-bl-md shadow-md border border-gray-300 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
            <div className="text-base leading-relaxed mb-3">Would you like to test another material?</div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleSubmit(null, 'yes')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm"
                disabled={isLoading}
              >
                Yes
              </button>
              <button
                onClick={() => handleSubmit(null, 'no')}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 shadow-sm"
                disabled={isLoading}
              >
                No
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-transparent">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex justify-center">
              <div className="relative w-full max-w-sm md:max-w-md">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your response..."
                  className="w-full px-6 py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-4 focus:ring-gray-400 focus:border-gray-500 transition-all duration-200 shadow-2xl bg-white text-gray-800"
                  disabled={isLoading}
                  style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-400 transition-all duration-200 shadow-lg flex items-center justify-center"
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
