import { useState, useEffect } from "react";

// --- Theme Constants ---
const GLOBAL_BG_COLOR = "#f2f0f0ff";
const COMPONENT_BG_COLOR = "#F5F5F5";
const LIGHT_TEXT_COLOR = "#000000";
const MAROON_START_COLOR = "#efc0c0ff";
const MAROON_END_COLOR = "#efc0c0ff";
const MAROON_COLOR = "#efc0c0ff";
const BUBBLE_RADIUS = "22px";
const SHADOW_LIGHT = "0 3px 10px rgba(69, 2, 2, 0.65)";
const SHADOW_DEEP = "0 4px 15px rgba(111, 2, 2, 0.4)";


// --- Parameter + Cluster Data ---
const parameters = [
  {
    key: "tensile_strength",
    label: "Tensile Strength (kN/m)",
    prompt: "Select the cluster for Tensile Strength:",
    clusters: [
      { id: "C1", name: "Low Strength", range: "0–30 kN/m", desc: "Landscaping, temporary erosion control, lightweight drainage layers." },
      { id: "C2", name: "Medium Strength", range: "31–60 kN/m", desc: "Subgrade separation in rural roads, light-duty roads." },
      { id: "C3", name: "High Strength", range: "61–120 kN/m", desc: "Reinforcement of paved roads, embankment stabilization." },
      { id: "C4", name: "Very High Strength", range: "121–200 kN/m", desc: "Retaining walls, heavy-duty highways, soft soil improvement." },
      { id: "C5", name: "Ultra High Strength", range: ">200 kN/m", desc: "Critical structures, mining haul roads, high embankments." },
    ],
  },
  {
    key: "puncture_resistance",
    label: "Puncture Resistance (N)",
    prompt: "Select the cluster for Puncture Resistance:",
    clusters: [
      { id: "C1", name: "Low Resistance", range: "≤ 600 N", desc: "Light separation, erosion control, vegetated slopes." },
      { id: "C2", name: "Medium Resistance", range: "601–1000 N", desc: "Subgrade stabilization for light vehicle paths." },
      { id: "C3", name: "High Resistance", range: "1001–1400 N", desc: "Urban roads, temporary working platforms." },
      { id: "C4", name: "Very High Resistance", range: "1401–1800 N", desc: "Pavement base reinforcement, embankments." },
      { id: "C5", name: "Ultra High Resistance", range: ">1800 N", desc: "Reinforced earth structures, heavy-duty traffic zones." },
    ],
  },
  {
    key: "permittivity",
    label: "Permittivity (s⁻¹)",
    prompt: "Select the cluster for Permittivity:",
    clusters: [
      { id: "C1", name: "Very Low", range: "≤ 0.2 s⁻¹", desc: "Reinforcement with minimal flow, base stabilization." },
      { id: "C2", name: "Low", range: "0.21–0.5 s⁻¹", desc: "Separation with controlled flow, coarse soils." },
      { id: "C3", name: "Moderate", range: "0.51–1.0 s⁻¹", desc: "General drainage, moderate rainfall zones." },
      { id: "C4", name: "High", range: "1.01–1.5 s⁻¹", desc: "High-permeability filters, soft soils." },
      { id: "C5", name: "Very High", range: ">1.5 s⁻¹", desc: "Rapid drainage, flood-prone zones, underdrains." },
    ],
  },
  {
    key: "filtration_efficiency",
    label: "Filtration Efficiency (%)",
    prompt: "Select the cluster for Filtration Efficiency:",
    clusters: [
      { id: "C1", name: "Low", range: "≤ 75%", desc: "Temporary applications, basic separation." },
      { id: "C2", name: "Moderate", range: "76–85%", desc: "General soil separation, stable soils." },
      { id: "C3", name: "High", range: "86–90%", desc: "Urban road filtration, culverts." },
      { id: "C4", name: "Very High", range: "91–95%", desc: "Fine silty soils, sensitive drainage." },
      { id: "C5", name: "Ultra High", range: ">95%", desc: "Critical water treatment, coastal filters." },
    ],
  },
  {
    key: "recycled_content",
    label: "Recycled Content (%)",
    prompt: "Select the cluster for Recycled Content:",
    clusters: [
      { id: "C1", name: "Virgin Material", range: "0%", desc: "Traditional PP/PET geotextiles." },
      { id: "C2", name: "Low Recycled", range: "1–30%", desc: "Minimal environmental impact, some sustainability." },
      { id: "C3", name: "Moderate Recycled", range: "31–60%", desc: "Balanced environmental and structural performance." },
      { id: "C4", name: "High Recycled", range: "61–99%", desc: "Strong sustainability focus, check strength tradeoffs." },
      { id: "C5", name: "Fully Recycled", range: "100%", desc: "Circular economy materials, sustainability prioritized." },
    ],
  },
  {
    key: "biobased_content",
    label: "Biobased Content (%)",
    prompt: "Select the cluster for Biobased Content:",
    clusters: [
      { id: "C1", name: "Non-Biobased", range: "0%", desc: "Petroleum-based synthetics (PP, PET, HDPE)." },
      { id: "C2", name: "Low Biobased", range: "1–30%", desc: "Partially blended PP + natural fibers." },
      { id: "C3", name: "Moderate Biobased", range: "31–70%", desc: "Emerging composites, experimental blends." },
      { id: "C4", name: "High Biobased", range: "71–99%", desc: "Mostly natural-fiber or PLA-based materials." },
      { id: "C5", name: "Fully Biobased", range: "100%", desc: "Jute, coir, PLA – biodegradable geotextiles." },
    ],
  },
  {
    key: "uv_strength",
    label: "UV Strength Retained (% after 500h)",
    prompt: "Select the cluster for UV Strength Retained:",
    clusters: [
      { id: "C1", name: "Very Low", range: "≤ 30%", desc: "Highly degradable, natural fibers like jute/coir." },
      { id: "C2", name: "Low", range: "31–50%", desc: "Moderate vulnerability, natural-synthetic hybrids." },
      { id: "C3", name: "Moderate", range: "51–70%", desc: "Standard UV resistance for most synthetics." },
      { id: "C4", name: "High", range: "71–85%", desc: "UV-stabilized synthetics, woven PET/PP." },
      { id: "C5", name: "Very High", range: ">85%", desc: "Premium coated materials, long-life geotextiles." },
    ],
  },
  {
    key: "material_cost",
    label: "Material Cost (PHP/m²)",
    prompt: "Select the cluster for Material Cost:",
    clusters: [
      { id: "C1", name: "Low Cost", range: "≤ PHP 100/m²", desc: "Lightweight nonwovens, coir/jute mats." },
      { id: "C2", name: "Moderate Cost", range: "PHP 101–200/m²", desc: "Basic woven geotextiles, hybrid blends." },
      { id: "C3", name: "High Cost", range: "PHP 201–400/m²", desc: "Reinforcement-grade PP/PET fabrics." },
      { id: "C4", name: "Very High Cost", range: "PHP 401–700/m²", desc: "Composite or geogrid-enhanced fabrics." },
      { id: "C5", name: "Ultra High Cost", range: "> PHP 700/m²", desc: "Premium, specialized, export-grade types." },
    ],
  },
  {
    key: "installation_cost",
    label: "Installation Cost (PHP/m²)",
    prompt: "Select the cluster for Installation Cost:",
    clusters: [
      { id: "C1", name: "Low Cost", range: "≤ PHP 50/m²", desc: "Manual placement, erosion blankets." },
      { id: "C2", name: "Moderate Cost", range: "PHP 51–100/m²", desc: "Routine rolls for subgrade support." },
      { id: "C3", name: "High Cost", range: "PHP 101–200/m²", desc: "Reinforcement under pavements." },
      { id: "C4", name: "Very High Cost", range: "PHP 201–350/m²", desc: "Composite installations, constrained sites." },
      { id: "C5", name: "Ultra High Cost", range: "> PHP 350/m²", desc: "MSE, steep slopes, geogrid anchoring." },
    ],
  },
];

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hello! I am your Geotextile Classifier Assistant. Let's classify your material by choosing clusters for each parameter." },
    { type: "bot", text: parameters[0].prompt }
  ]);
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({});
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [awaitingRestart, setAwaitingRestart] = useState(false);
  const [showCards, setShowCards] = useState(false);

  const scrollToBottom = () => {
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
  };

  useEffect(() => scrollToBottom(), [displayedMessages, selectedCluster, isLoading]);

  // Display messages one by one with typing effect
  useEffect(() => {
    if (messages.length > displayedMessages.length) {
      const nextMessage = messages[displayedMessages.length];
      if (nextMessage.type === "bot") {
        setIsLoading(true);
        setShowCards(false);
        const timeout = setTimeout(() => {
          setDisplayedMessages((prev) => [...prev, nextMessage]);
          setIsLoading(false);
          // Show cards only if currentStep < parameters.length
          if (currentStep < parameters.length && !awaitingRestart) setShowCards(true);
        }, 600);
        return () => clearTimeout(timeout);
      } else {
        setDisplayedMessages((prev) => [...prev, nextMessage]);
      }
    }
  }, [messages, displayedMessages]);

  const handleSelect = (idx) => setSelectedCluster(idx);

  const handleConfirm = () => {
    const cluster = parameters[currentStep]?.clusters[selectedCluster];
    if (!cluster && currentStep < parameters.length) return;

    if (currentStep < parameters.length) {
      setMessages((prev) => [
        ...prev,
        { type: "user", text: `${cluster.id}: ${cluster.name}` },
        { type: "bot", text: `You selected ${cluster.id}: ${cluster.name} (${cluster.range}). ${cluster.desc}` },
      ]);
      setData({ ...data, [parameters[currentStep].key]: selectedCluster + 1 });
      setSelectedCluster(null);

      if (currentStep < parameters.length - 1) {
        const nextParam = parameters[currentStep + 1];
        setMessages((prev) => [...prev, { type: "bot", text: nextParam.prompt }]);
        setCurrentStep(currentStep + 1);
      } else {
        setMessages((prev) => [...prev, { type: "bot", text: "All selections completed. Do you want to classify this material?" }]);
        setCurrentStep(parameters.length);
      }
    }
  };

  const handleDecision = async (decision) => {
    setMessages((prev) => [...prev, { type: "user", text: decision }]);

    if (!awaitingRestart) {
      if (decision === "yes") {
        setIsLoading(true);
        try {
          const response = await fetch("http://localhost:8000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ features: Object.values(data) }),
          });
          const result = await response.json();
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: `Classification complete!\n\nPredicted Geotextile Type: ${result.predicted_type}\nConfidence: ${result.confidence}%\n\n${result.description}\n\nWould you like to test another material?`,
            },
          ]);
          setAwaitingRestart(true);
        } catch (err) {
          console.error(err);
          setMessages((prev) => [...prev, { type: "bot", text: "Error connecting to backend." }]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setMessages((prev) => [...prev, { type: "bot", text: "Okay! Thank you for using the Geotextile Classifier." }]);
      }
    } else {
      if (decision === "yes") {
        setData({});
        setSelectedCluster(null);
        setCurrentStep(0);
        setDisplayedMessages([]);
        setMessages([
          { type: "bot", text: "Hello! I am your Geotextile Classifier Assistant. Let's classify your material by choosing clusters for each parameter." },
          { type: "bot", text: parameters[0].prompt },
        ]);
        setAwaitingRestart(false);
      } else {
        setMessages((prev) => [...prev, { type: "bot", text: "Okay! Thank you for using the Geotextile Classifier." }]);
      }
    }
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: GLOBAL_BG_COLOR,
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
          '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><path d="M0 100 Q50 50 100 100 T200 100" stroke="#e0b3b3" stroke-width="1" fill="none" opacity="0.2"/><path d="M0 120 Q50 70 100 120 T200 120" stroke="#e0b3b3" stroke-width="1" fill="none" opacity="0.2"/></svg>'
        )}")`,
        backgroundRepeat: "repeat",
        color: LIGHT_TEXT_COLOR,
      }}
    >
      {/* HEADER */}
      <div className="p-6 flex items-center justify-start space-x-4">
        <img src="/maroon.png" alt="Geotextile Classifier Logo" className="w-12 h-12" style={{ objectFit: "cover" }} />
        <div className="text-left">
          <h1 className="text-3xl font-bold">Geotextile Classifier</h1>
          <p className="text-base opacity-80" style={{ color: LIGHT_TEXT_COLOR }}>AI-Powered Material Classification</p>
        </div>
      </div>

      <div id="chat-container" className="flex-1 overflow-y-auto p-6 space-y-6">
        {displayedMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              style={{
                backgroundColor: msg.type === "user" ? MAROON_COLOR : COMPONENT_BG_COLOR,
                color: msg.type === "user" ? "#fff" : LIGHT_TEXT_COLOR,
                padding: "12px 20px",
                borderRadius: msg.type === "user" ? "25px 25px 5px 25px" : "25px 25px 25px 5px",
                boxShadow: SHADOW_LIGHT,
                maxWidth: "65%",
                whiteSpace: "pre-line",
                transition: "all 0.4s ease", // SMOOTH entrance for cards
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div style={{ backgroundColor: COMPONENT_BG_COLOR, color: LIGHT_TEXT_COLOR, padding: "12px 20px", borderRadius: "25px 25px 25px 5px", boxShadow: SHADOW_LIGHT, maxWidth: "65%" }}>
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}

       {/* CLUSTER SELECTION WITH STAGGERED FADE-IN */}
          {currentStep < parameters.length && !isLoading && showCards && (
            <div className="max-w-full mx-auto space-y-3">
              {/* Inline style for fadeIn keyframes */}
              <style>
                {`
                  @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                `}
              </style>

              {parameters[currentStep].clusters.map((cluster, idx) => (
                <div
                  key={cluster.id}
                  onClick={() => handleSelect(idx)}
                  className={`w-full cursor-pointer py-4 px-3 rounded-lg bg-white shadow-md`}
                  style={{
                    opacity: 0,
                    animation: `fadeIn 0.5s ease forwards`,
                    animationDelay: `${idx * 0.15}s`, // stagger each card
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-semibold">{cluster.id}: {cluster.name}</div>
                    <div className="text-gray-600 text-sm">{cluster.range}</div>
                  </div>
                  {selectedCluster === idx && (
                    <div className="mt-2 text-gray-700 text-sm">
                      {cluster.desc} ({cluster.range})
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={handleConfirm}
                disabled={selectedCluster === null}
                className="mt-3 w-full py-2 rounded-lg font-bold"
                style={{
                  backgroundColor: MAROON_COLOR,
                  color: "#fff",
                  opacity: 0,
                  animation: `fadeIn 0.5s ease forwards`,
                  animationDelay: `${parameters[currentStep].clusters.length * 0.15}s`,
                }}
              >
                Confirm
              </button>
            </div>
          )}




        {/* FINAL YES/NO */}
        {currentStep >= parameters.length && !isLoading && (
          <div className="flex justify-center space-x-4 mt-3">
            <button
              onClick={() => handleDecision("yes")}
              className="px-6 py-2 rounded-lg font-bold"
              style={{ backgroundColor: MAROON_COLOR, color: "#fff" }}
            >
              Yes
            </button>
            <button
              onClick={() => handleDecision("no")}
              className="px-6 py-2 rounded-lg font-bold"
              style={{ backgroundColor: "#ccc", color: "#000" }}
            >
              No
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;

