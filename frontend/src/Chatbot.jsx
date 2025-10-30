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

// --- Cluster Descriptions ---
const clusterDescriptions = {
  C1: "Low",
  C2: "Moderate",
  C3: "Balanced",
  C4: "High",
  C5: "Very High"
};

// --- Priorities and Subflows ---
const priorities = [
  {
    key: "tensile_strength",
    label: "Handle traffic/loads (Tensile Strength)",
    subflow: [
      {
        bot: "Ready to choose how strong the fabric needs to be?",
        options: [
          { text: "Yes, let’s start", clusters: [] }
        ]
      },
      {
        bot: "To size up the fabric strength, tell me about the traffic and ground.",
        options: [{ text: "Okay", clusters: [] }]
      },
      {
        bot: "Who will pass over it in the first year?",
        options: [
          { text: "People only (Footpaths/landscaping; negligible wheel loads)", clusters: ["C1"] },
          { text: "Light vehicles (cars/pickups)", clusters: ["C2"] },
          { text: "Mixed traffic (cars + trucks)", clusters: ["C3"] },
          { text: "Heavy trucks/frequent loading", clusters: ["C4"] },
          { text: "Extreme/heavy industry (Mining/ports)", clusters: ["C5"] },
        ]
      },
      {
        bot: "What’s the ground like where the fabric sits?",
        options: [
          { text: "Firm soil (compacts well)", clusters: ["C1", "C2"] },
          { text: "Soft in places", clusters: ["C2", "C3"] },
          { text: "Very soft/wet (rutting risk)", clusters: ["C4", "C5"] },
        ]
      },
      {
        bot: "How long should it perform (design life)?",
        options: [
          { text: "Temporary (<6 months)", clusters: ["C1"] },
          { text: "Short-term (6–24 months)", clusters: ["C2"] },
          { text: "Long-term (2–10 years)", clusters: ["C3", "C4"] },
          { text: "Long-term critical (10+ years)", clusters: ["C5"] },
        ]
      },
      {
        bot: "What’s the project type?",
        options: [
          { text: "Slope or embankment support", clusters: ["C1"] },
          { text: "Road over weak subgrade", clusters: ["C2"] },
          { text: "Drainage trench backfill", clusters: ["C3"] },
          { text: "Retaining/MSE wall", clusters: ["C4", "C5"] },
        ]
      },
      {
        bot: "Comfort level (safety margin vs. cost)?",
        options: [
          { text: "Practical & economical", clusters: ["C1", "C2"] },
          { text: "Balanced safety & cost", clusters: ["C3", "C4"] },
          { text: "Extra margin / future-proof", clusters: ["C5"] },
        ]
      },
    ]
  },
  {
    key: "puncture_resistance",
    label: "Resist sharp stones & tears (Puncture Resistance)",
    subflow: [
      {
        bot: "Let's move on to the location of your textile.",
        options: [
          { text: "Okay", clusters: [] },
          { text: "Not now", skip: true }
        ]
      },
      {
        bot: "What will the fabric rest on when you lay it down?",
        options: [
          { text: "Smooth sand/soil", clusters: ["C1"] },
          { text: "Small rounded gravel", clusters: ["C2"] },
          { text: "Crushed gravel (sharp edges)", clusters: ["C3"] },
          { text: "Big sharp stones / riprap", clusters: ["C4"] },
          { text: "Mixed debris (concrete bits, nails, glass)", clusters: ["C5"] },
        ]
      },
      {
        bot: "Will any machine roll on the fabric before it’s covered?",
        options: [
          { text: "No—covered right away", clusters: ["C1", "C2"] },
          { text: "Maybe—slow and careful only", clusters: ["C3", "C4"] },
          { text: "Yes—trucks/loaders will pass", clusters: ["C5"] },
        ]
      },
    ]
  },
  {
    key: "permittivity",
    label: "Let water pass easily (Permittivity)",
    subflow: [
      {
        bot: "Let's set the amount of water passing through these fabrics.",
        options: [
          { text: "Alright!", clusters: [] },
          { text: "Not now", skip: true }
        ]
      },
      {
        bot: "How does water usually behave here?",
        options: [
          { text: "Mostly dry", clusters: ["C1"] },
          { text: "Sometimes wet after rain", clusters: ["C2"] },
          { text: "Often damp; slow seepage", clusters: ["C3"] },
          { text: "Water rises fast or drops fast", clusters: ["C4"] },
          { text: "Standing water during storms", clusters: ["C5"] },
        ]
      },
      {
        bot: "Surface cover and traffic over the fabric?",
        options: [
          { text: "No vehicular traffic", clusters: ["C1", "C2"] },
          { text: "Light/slow traffic", clusters: ["C3"] },
          { text: "Heavy cover or frequent wetting", clusters: ["C4"] },
          { text: "Under drains/swales", clusters: ["C5"] },
        ]
      },
    ]
  },
  {
    key: "filtration_efficiency",
    label: "Keep soil from escaping/clogging (Filtration Efficiency)",
    subflow: [
      {
        bot: "Ready to make sure the fabric lets water pass but keeps soil in?",
        options: [
          { text: "Yes, let’s start", clusters: [] },
          { text: "Not now", skip: true }
        ]
      },
      {
        bot: "“Filtration efficiency” means how well the fabric holds back soil while letting water through. Higher % = less soil loss.",
        options: [{ text: "Got it!", clusters: [] }]
      },
      {
        bot: "What does the soil feel like?",
        options: [
          { text: "Gritty (sand)", clusters: ["C1", "C2"] },
          { text: "Slightly powdery", clusters: ["C3"] },
          { text: "Silky/muddy", clusters: ["C4", "C5"] },
        ]
      },
      {
        bot: "What are you protecting from soil wash-through?",
        options: [
          { text: "Nothing critical", clusters: ["C1", "C2"] },
          { text: "Road base/subdrain", clusters: ["C3"] },
          { text: "Sensitive drain/pipe", clusters: ["C4"] },
          { text: "Water treatment/coastal edge", clusters: ["C5"] },
        ]
      },
    ]
  },
  {
    key: "recycled_content",
    label: "Use recycled materials (Recycled Content)",
    subflow: [
      {
        bot: "Want to set your sustainability preference? (How much recycled plastic is in the fabric.)",
        options: [
          { text: "Yes, let’s set it", clusters: [] },
          { text: "Not now", skip: true }
        ]
      },
      {
        bot: "Higher recycled content = greener footprint, but can narrow product choices. What matters most?",
        options: [{ text: "Let’s find out", clusters: [] }]
      },
      {
        bot: "How important is “made from recycled plastic”?",
        options: [
          { text: "Nice to have", clusters: ["C1", "C2"] },
          { text: "Important", clusters: ["C3", "C4"] },
          { text: "Must have", clusters: ["C5"] },
        ]
      },
      {
        bot: "If fewer eco options exist, what should we favor?",
        options: [
          { text: "Performance first", clusters: ["C1", "C2"] },
          { text: "Balanced", clusters: ["C3"] },
          { text: "Green first", clusters: ["C4", "C5"] },
        ]
      },
    ]
  },
  {
    key: "biobased_content",
    label: "Use plant-based/natural fibers (Biobased Content)",
    subflow: [
      {
        bot: "🌿 Do you want plant-based/natural fibers (jute/coir) or regular plastics?",
        options: [
          { text: "Yes, set preference", clusters: [] },
          { text: "Not now", skip: true }
        ]
      },
      {
        bot: "How important is “plant-based” for this project?",
        options: [
          { text: "Nice to have", clusters: ["C1", "C2"] },
          { text: "Important", clusters: ["C3", "C4"] },
          { text: "Must have", clusters: ["C5"] },
        ]
      },
      {
        bot: "How long must it last on-site?",
        options: [
          { text: "10+ years", clusters: ["C1"] },
          { text: "3–10 years", clusters: ["C2"] },
          { text: "1–2 years", clusters: ["C3"] },
          { text: "Months", clusters: ["C4"] },
          { text: "Weeks", clusters: ["C5"] },
        ]
      },
    ]
  },
  {
    key: "uv_strength",
    label: "Hold strength under sunlight (UV Strength Retained after 500h)",
    subflow: [
      {
        bot: "☀️ Sunlight weakens fabric. Let’s set UV toughness.",
        options: [
          { text: "Yes, let’s set it", clusters: [] },
          { text: "No, not now", skip: true }
        ]
      },
      {
        bot: "How long will it sit in the sun before being covered?",
        options: [
          { text: "Few days (<1 week)", clusters: ["C1", "C2"] },
          { text: "1–4 weeks", clusters: ["C3"] },
          { text: "1 month", clusters: ["C4"] },
          { text: "Not sure", clusters: ["C5"] },
        ]
      },
      {
        bot: "Weather during installation?",
        options: [
          { text: "Cloudy/rainy", clusters: ["C1", "C2", "C3"] },
          { text: "Mix of sun and clouds", clusters: ["C4"] },
          { text: "Hot/dry", clusters: ["C5"] },
        ]
      },
      {
        bot: "Fabric type preference (if known)?",
        options: [
          { text: "Natural/plant-based (jute/coir)", clusters: ["C1", "C2"] },
          { text: "Standard plastic (PP/PET)", clusters: ["C3"] },
          { text: "UV-stabilized / dark-colored", clusters: ["C4", "C5"] },
        ]
      },
    ]
  },
  {
    key: "material_cost",
    label: "Lower fabric price (₱/m²) (Material Cost)",
    subflow: [
      {
        bot: "💸 Let’s set a budget for fabric cost (₱/m²).",
        options: [
          { text: "Yes, set budget", clusters: [] },
          { text: "No, not now", skip: true }
        ]
      },
      {
        bot: "Pick your price band:",
        options: [
          { text: "≤ ₱100 — Low (light nonwovens, coir/jute)", clusters: ["C1"] },
          { text: "₱101–₱200 — Moderate (basic woven)", clusters: ["C2"] },
          { text: "₱201–₱400 — High (reinforcement-grade PP/PET)", clusters: ["C3"] },
          { text: "₱401–₱700 — Very High (composites/geogrid)", clusters: ["C4"] },
          { text: "₱700 — Ultra (specialized/export-grade)", clusters: ["C5"] },
        ]
      },
      {
        bot: "Do you need fast delivery?",
        options: [
          { text: "ASAP", clusters: ["C5"] },
          { text: "Flexible", clusters: ["C1"] },
        ]
      },
    ]
  },
  {
    key: "installation_cost",
    label: "Easier/cheaper to install (₱/m²) (Installation Cost)",
    subflow: [
      {
        bot: "🛠️ Let’s set installation budget (₱/m²).",
        options: [
          { text: "Yes, set install budget", clusters: [] },
          { text: "No, not now", skip: true }
        ]
      },
      {
        bot: "Pick your install cost band:",
        options: [
          { text: "≤ ₱50 — Low (manual/erosion blankets)", clusters: ["C1"] },
          { text: "₱51–₱100 — Moderate (routine rolls)", clusters: ["C2"] },
          { text: "₱101–₱200 — High (reinforcement; precise seams)", clusters: ["C3"] },
          { text: "₱201–₱350 — Very High (tight/confined sites)", clusters: ["C4"] },
          { text: "₱350 — Ultra (MSE/slopes; high QA)", clusters: ["C5"] },
        ]
      },
      {
        bot: "What does the work area look like?",
        options: [
          { text: "Wide open", clusters: ["C1", "C2"] },
          { text: "Some tight corners", clusters: ["C3"] },
          { text: "Very tight/obstacles", clusters: ["C4", "C5"] },
        ]
      },
      {
        bot: "What can you bring onto the site?",
        options: [
          { text: "Full access", clusters: ["C1"] },
          { text: "Small loader/excavator", clusters: ["C2", "C3"] },
          { text: "Small tools only", clusters: ["C4", "C5"] },
        ]
      },
      {
        bot: "Any strict inspection or QA?",
        options: [
          { text: "Basic photos", clusters: ["C1", "C2"] },
          { text: "Standard QA", clusters: ["C3"] },
          { text: "Full QA/sign-offs", clusters: ["C4", "C5"] },
        ]
      },
      {
        bot: "Is geotextile placement tied to other crews?",
        options: [
          { text: "Independent", clusters: ["C1", "C2"] },
          { text: "Some coordination", clusters: ["C3", "C4"] },
          { text: "Heavily interlocked", clusters: ["C5"] },
        ]
      },
    ]
  },
];

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hello! 👋 I’m your Geo Assistant. Ready to pick the right geotextile for your project?" },
  ]);
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [selectedClusters, setSelectedClusters] = useState({});
  const [currentPriorityIndex, setCurrentPriorityIndex] = useState(-1);
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [awaitingRestart, setAwaitingRestart] = useState(false);
  const [showPriorityOptions, setShowPriorityOptions] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [modes, setModes] = useState({});
  const [completedPriorities, setCompletedPriorities] = useState(new Set());
  const [showRemainingPriorities, setShowRemainingPriorities] = useState(false);
  const [hasSkipped, setHasSkipped] = useState(false);
  const [predictionTriggered, setPredictionTriggered] = useState(false);


  const scrollToBottom = () => {
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
  };

  useEffect(() => scrollToBottom(), [displayedMessages, isLoading]);

  // Display messages one by one with typing effect
  useEffect(() => {
    if (messages.length > displayedMessages.length) {
      const nextMessage = messages[displayedMessages.length];
      if (nextMessage.type === "bot") {
        setIsLoading(true);
        const timeout = setTimeout(() => {
          setDisplayedMessages((prev) => [...prev, nextMessage]);
          setIsLoading(false);
        }, 600);
        return () => clearTimeout(timeout);
      } else {
        setDisplayedMessages((prev) => [...prev, nextMessage]);
      }
    }
  }, [messages, displayedMessages]);

  const getMode = (clusters) => {
    if (clusters.length === 0) return 'C3'; // Default if skipped
    const count = {};
    clusters.forEach(c => count[c] = (count[c] || 0) + 1);
    let maxCount = 0;
    let candidates = [];
    for (let c in count) {
      if (count[c] > maxCount) {
        maxCount = count[c];
        candidates = [c];
      } else if (count[c] === maxCount) {
        candidates.push(c);
      }
    }
    candidates.sort((a, b) => b.localeCompare(a));
    return candidates[0];
  };

  const handleInitialDecision = (decision) => {
    setMessages((prev) => [...prev, { type: "user", text: decision }]);
    if (decision === "Yes, let’s start") {
      setMessages((prev) => [...prev, { type: "bot", text: "Awesome. Which do you want to prioritize first?" }]);
      setShowPriorityOptions(true);
    } else {
      setMessages((prev) => [...prev, { type: "bot", text: "Okay! Thank you for using the Geo Assistant." }]);
    }
  };

  const handlePrioritySelect = (idx) => {
    setMessages((prev) => [...prev, { type: "user", text: priorities[idx].label }]);
    setCurrentPriorityIndex(idx);
    setCurrentSubStep(0);
    setShowPriorityOptions(false);
    const firstStep = priorities[idx].subflow[0];
    setMessages((prev) => [...prev, { type: "bot", text: firstStep.bot }]);
  };

  const handleOptionSelect = async (option) => {
    setMessages((prev) => [...prev, { type: "user", text: option.text }]);
    if (option.skip) {
      // Mark this priority as completed (skipped)
      const newCompleted = new Set([...completedPriorities, priorities[currentPriorityIndex].key]);
      setCompletedPriorities(newCompleted);
      // Show remaining priorities for user to choose
      setMessages((prev) => [...prev, { type: "bot", text: "Okay, let's skip that. Which priority would you like to focus on next?" }]);
      const remaining = priorities.filter(p => !newCompleted.has(p.key));
      if (remaining.length > 0) {
        setCurrentPriorityIndex(-1);
        setShowRemainingPriorities(true);
      } else {
        // All done, proceed with prediction
        const newModes = {};
        priorities.forEach(p => {
          newModes[p.key] = getMode(selectedClusters[p.key] || []);
        });
        setModes(newModes);
        setPredictionTriggered(true);
        setIsLoading(true);
        try {
          const clusterKeyMap = {
            tensile_strength: "Tensile Cluster",
            puncture_resistance: "Puncture Cluster",
            permittivity: "Permittivity Cluster",
            filtration_efficiency: "Filtration Cluster",
            recycled_content: "Recycled Cluster",
            biobased_content: "Biobased Cluster",
            uv_strength: "UV Cluster",
            material_cost: "Material Cost Cluster",
            installation_cost: "Install Cost Cluster"
          };
          const clusters = {};
          priorities.forEach(p => {
            clusters[clusterKeyMap[p.key]] = newModes[p.key];
          });
          const response = await fetch("http://localhost:8000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clusters }),
          });
          const result = await response.json();
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: `Prediction complete!\n\nPredicted Geotextile Type: ${result.predicted_type}\nConfidence: ${result.confidence}%\n\n${result.description}\n\nWould you like to test another material?`,
            },
          ]);
          setAwaitingRestart(true);
        } catch (err) {
          console.error(err);
          setMessages((prev) => [...prev, { type: "bot", text: "Error connecting to backend." }]);
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      // Normal option
      const key = priorities[currentPriorityIndex].key;
      setSelectedClusters((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), ...(option.clusters || [])]
      }));
      if (currentSubStep < priorities[currentPriorityIndex].subflow.length - 1) {
        setCurrentSubStep(currentSubStep + 1);
        const nextStep = priorities[currentPriorityIndex].subflow[currentSubStep + 1];
        setMessages((prev) => [...prev, { type: "bot", text: nextStep.bot }]);
      } else {
        // Completed this priority
        const newCompleted = new Set([...completedPriorities, key]);
        setCompletedPriorities(newCompleted);
        if (newCompleted.size === priorities.length) {
          // All priorities handled, proceed with prediction
          const newModes = {};
          priorities.forEach(p => {
            newModes[p.key] = getMode(selectedClusters[p.key] || []);
          });
          setModes(newModes);
          setPredictionTriggered(true);
          setIsLoading(true);
          try {
            const clusterKeyMap = {
              tensile_strength: "Tensile Cluster",
              puncture_resistance: "Puncture Cluster",
              permittivity: "Permittivity Cluster",
              filtration_efficiency: "Filtration Cluster",
              recycled_content: "Recycled Cluster",
              biobased_content: "Biobased Cluster",
              uv_strength: "UV Cluster",
              material_cost: "Material Cost Cluster",
              installation_cost: "Install Cost Cluster"
            };
            const clusters = {};
            priorities.forEach(p => {
              clusters[clusterKeyMap[p.key]] = newModes[p.key];
            });
            const response = await fetch("http://localhost:8000/predict", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ clusters }),
            });
            const result = await response.json();
            setMessages((prev) => [
              ...prev,
              {
                type: "bot",
                text: `Prediction complete!\n\nPredicted Geotextile Type: ${result.predicted_type}\nConfidence: ${result.confidence}%\n\n${result.description}\n\nWould you like to test another material?`,
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
          // Show remaining priorities
          setCurrentPriorityIndex(-1);
          setShowRemainingPriorities(true);
          setMessages((prev) => [...prev, { type: "bot", text: "Okay, priority completed. Which priority would you like to focus on next?" }]);
        }
      }
    }
  };

  const handleContinue = () => {
    setMessages((prev) => [...prev, { type: "user", text: "Continue" }]);
    if (currentPriorityIndex < priorities.length - 1) {
      setCurrentPriorityIndex(currentPriorityIndex + 1);
      const nextFirstStep = priorities[currentPriorityIndex + 1].subflow[0];
      setMessages((prev) => [...prev, { type: "bot", text: nextFirstStep.bot }]);
    } else {
      // Compute modes
      const newModes = {};
      priorities.forEach(p => {
        newModes[p.key] = getMode(selectedClusters[p.key] || []);
      });
      setModes(newModes);
      setShowSummary(true);
      const summary = "Here are your selections:\n" + priorities.map(p => `${p.label}: ${newModes[p.key]}`).join('\n') + "\n\nDo you want to proceed with the prediction?";
      setMessages((prev) => [...prev, { type: "bot", text: summary }]);
    }
  };

  const handleFinalDecision = async (decision) => {
    setMessages((prev) => [...prev, { type: "user", text: decision }]);
    if (!awaitingRestart) {
      if (decision === "yes") {
        setIsLoading(true);
        try {
          const clusterKeyMap = {
            tensile_strength: "Tensile Cluster",
            puncture_resistance: "Puncture Cluster",
            permittivity: "Permittivity Cluster",
            filtration_efficiency: "Filtration Cluster",
            recycled_content: "Recycled Cluster",
            biobased_content: "Biobased Cluster",
            uv_strength: "UV Cluster",
            material_cost: "Material Cost Cluster",
            installation_cost: "Install Cost Cluster"
          };
          const clusters = {};
          priorities.forEach(p => {
            clusters[clusterKeyMap[p.key]] = modes[p.key];
          });
          const response = await fetch("http://localhost:8000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clusters }),
          });
          const result = await response.json();
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: `Prediction complete!\n\nPredicted Geotextile Type: ${result.predicted_type}\nConfidence: ${result.confidence}%\n\n${result.description}\n\nWould you like to test another material?`,
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
        setMessages((prev) => [...prev, { type: "bot", text: "Okay! Thank you for using the Geo Assistant." }]);
      }
    } else {
      if (decision === "yes") {
        setSelectedClusters({});
        setCurrentPriorityIndex(-1);
        setCurrentSubStep(0);
        setDisplayedMessages([]);
        setMessages([
          { type: "bot", text: "Hello! 👋 I’m your Geo Assistant. Ready to pick the right geotextile for your project?" },
        ]);
        setAwaitingRestart(false);
        setShowPriorityOptions(false);
        setShowSummary(false);
        setModes({});
      } else {
        setMessages((prev) => [...prev, { type: "bot", text: "Okay! Thank you for using the Geo Assistant." }]);
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
        <img src="/maroon.png" alt="Geo Assistant Logo" className="w-12 h-12" style={{ objectFit: "cover" }} />
        <div className="text-left">
          <h1 className="text-3xl font-bold">Geotextile Classifier</h1>
          <p className="text-base opacity-80" style={{ color: LIGHT_TEXT_COLOR }}>AI-Powered Geotextile Recommendation</p>
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
                transition: "all 0.4s ease",
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

        {/* INITIAL YES/NO */}
        {currentPriorityIndex === -1 && !showPriorityOptions && !showRemainingPriorities && !isLoading && (
          <div className="flex justify-center space-x-4 mt-3">
            <button
              onClick={() => handleInitialDecision("Yes, let’s start")}
              className="px-6 py-2 rounded-lg font-bold"
              style={{ backgroundColor: MAROON_COLOR, color: "#fff" }}
            >
              Yes
            </button>
            <button
              onClick={() => handleInitialDecision("No")}
              className="px-6 py-2 rounded-lg font-bold"
              style={{ backgroundColor: "#ccc", color: "#000" }}
            >
              No
            </button>
          </div>
        )}

        {/* PRIORITY OPTIONS */}
        {showPriorityOptions && !isLoading && (
          <div className="max-w-full mx-auto space-y-3">
            <style>
              {`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}
            </style>
            {priorities.map((priority, idx) => (
              <div
                key={priority.key}
                onClick={() => handlePrioritySelect(idx)}
                className="w-full cursor-pointer py-4 px-3 rounded-lg bg-white shadow-md"
                style={{
                  opacity: 0,
                  animation: `fadeIn 0.5s ease forwards`,
                  animationDelay: '0s',
                }}
              >
                <div className="font-semibold">{priority.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* REMAINING PRIORITY OPTIONS */}
        {showRemainingPriorities && !isLoading && (
          <div className="max-w-full mx-auto space-y-3">
            <style>
              {`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}
            </style>
            {priorities.filter(p => !completedPriorities.has(p.key)).map((priority, idx) => (
              <div
                key={priority.key}
                onClick={() => {
                  const priorityIndex = priorities.findIndex(p => p.key === priority.key);
                  setCurrentPriorityIndex(priorityIndex);
                  setCurrentSubStep(0);
                  setShowRemainingPriorities(false);
                  const firstStep = priority.subflow[0];
                  setMessages((prev) => [...prev, { type: "bot", text: firstStep.bot }]);
                }}
                className="w-full cursor-pointer py-4 px-3 rounded-lg bg-white shadow-md"
                style={{
                  opacity: 0,
                  animation: `fadeIn 0.5s ease forwards`,
                  animationDelay: `${idx * 0.15}s`,
                }}
              >
                <div className="font-semibold">{priority.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* SUBFLOW OPTIONS */}
        {currentPriorityIndex >= 0 && currentPriorityIndex < priorities.length && !isLoading && !showSummary && (
          <div className="max-w-full mx-auto space-y-3">
            <style>
              {`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}
            </style>
            {priorities[currentPriorityIndex].subflow[currentSubStep].options.map((option, idx) => (
              <div
                key={idx}
                onClick={() => handleOptionSelect(option)}
                className="w-full cursor-pointer py-4 px-3 rounded-lg bg-white shadow-md"
                style={{
                  opacity: 0,
                  animation: `fadeIn 0.5s ease forwards`,
                  animationDelay: `${idx * 0.15}s`,
                }}
              >
                <div className="font-semibold">{option.text}</div>
              </div>
            ))}
          </div>
        )}

        {/* FINAL YES/NO */}
        {showSummary && !isLoading && (
          <div className="flex justify-center space-x-4 mt-3">
            <button
              onClick={() => handleFinalDecision("yes")}
              className="px-6 py-2 rounded-lg font-bold"
              style={{ backgroundColor: MAROON_COLOR, color: "#fff" }}
            >
              Yes
            </button>
            <button
              onClick={() => handleFinalDecision("no")}
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
