import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaInfoCircle } from "react-icons/fa";
import TypingIndicator from "./TypingIndicator";

// --- Theme Constants ---
const GLOBAL_BG_COLOR = "#f2f0f0ff";
const COMPONENT_BG_COLOR = "#F5F5F5";
const LIGHT_TEXT_COLOR = "#333333";
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
          { text: "Yes, let’s start", clusters: [] },
          { text: "Not now", skip: true }
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
          { text: "Not now", skip: true }
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
          { text: "Full QA/sign-offs", clusters: ["C4","C5"] },
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
  const [displayedMessages, setDisplayedMessages] = useState(messages);
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

  // State machine states
  const [showInitialOptions, setShowInitialOptions] = useState(false);
  const [showSubflowOptions, setShowSubflowOptions] = useState(false);
  const [awaitingOptions, setAwaitingOptions] = useState(null);

  // Model info modal state
  const [showModelInfo, setShowModelInfo] = useState(false);


  // --- "SMART" SCROLL FUNCTION ---
  const scrollToBottom = () => {
    // We target 'chat-container' which is the main scrolling div
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
      // This check is the "smart" part:
      // Only scroll if the content is taller than the visible container
      if (chatContainer.scrollHeight > chatContainer.clientHeight) {
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: "smooth"
        });
      }
    }
  };

  // --- 
  // --- CONSOLIDATED SCROLLING HOOK ---
  // ---
  useEffect(() => {
    // We scroll ONLY if the typing indicator appears OR if any options appear
    if (isLoading || showInitialOptions || showPriorityOptions || showRemainingPriorities || showSubflowOptions || showSummary) {
      const timer = setTimeout(() => {
        scrollToBottom(); // The "smart" scroll function will check if it *needs* to.
      }, 50); // 50ms delay to let React render the options/indicator first
      return () => clearTimeout(timer);
    }
  }, [isLoading, showInitialOptions, showPriorityOptions, showRemainingPriorities, showSubflowOptions, showSummary]);

  // This useEffect hook handles showing *new* bot messages
  useEffect(() => {
    // Only run if there are new messages to display
    if (messages.length > displayedMessages.length) {
      const nextMessage = messages[displayedMessages.length];
      if (nextMessage.type === "bot") {
        setIsLoading(true);
        const timeout = setTimeout(() => {
          setDisplayedMessages((prev) => [...prev, nextMessage]);
          setIsLoading(false);
        }, 500);
        return () => clearTimeout(timeout);
      } else {
        // User messages appear instantly
        setDisplayedMessages((prev) => [...prev, nextMessage]);
      }
    }
  }, [messages, displayedMessages]);

  // This useEffect hook waits for loading to finish, then
  // waits a "read time", then shows the appropriate options.
  useEffect(() => {
    if (!isLoading && awaitingOptions) {

      const timer = setTimeout(() => {
        if (awaitingOptions === 'initial') {
          setShowInitialOptions(true);
        }
        if (awaitingOptions === 'priorityList') {
          setShowPriorityOptions(true);
        }
        if (awaitingOptions === 'subflow') {
          setShowSubflowOptions(true);
        }
        if (awaitingOptions === 'remainingPriorities') {
          setShowRemainingPriorities(true);
        }

        setAwaitingOptions(null);
      }, 250); // 250ms "read time"

      return () => clearTimeout(timer);
    }
  }, [isLoading, awaitingOptions]);


  // This shows the very first "Yes/No" options after the initial greeting
  useEffect(() => {
    // Check if *only* the first message is displayed
    if (displayedMessages.length === 1 && messages.length === 1) {
      setAwaitingOptions('initial');
    }
  }, [displayedMessages, messages]);

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
    setShowInitialOptions(false);
    setMessages((prev) => [...prev, { type: "user", text: decision }]);

    setTimeout(() => {
      setIsLoading(true);

      setTimeout(() => { // "Thinking" delay
        if (decision === "Yes, let’s start") {
          setMessages((prev) => [...prev, { type: "bot", text: "Awesome. Which do you want to prioritize first?" }]);
          setAwaitingOptions('priorityList');
        } else {
          setMessages((prev) => [...prev, { type: "bot", text: "Okay! Thank you for using the Geo Assistant." }]);
        }
      }, 500);

    }, 800);
  };

  const startPrioritySubflow = (idx) => {
    const priorityLabel = priorities[idx].label;
    setMessages((prev) => {
      if (prev[prev.length - 1].text !== priorityLabel) {
        return [...prev, { type: "user", text: priorityLabel }];
      }
      return prev;
    });
    setCurrentPriorityIndex(idx);
    setCurrentSubStep(0);

    setTimeout(() => {
      setIsLoading(true);

      setTimeout(() => {
        const firstStep = priorities[idx].subflow[0];
        setMessages((prev) => [...prev, { type: "bot", text: firstStep.bot }]);
        setAwaitingOptions('subflow');
      }, 500);

    }, 800);
  }

  const handlePrioritySelect = (idx) => {
    setShowPriorityOptions(false);
    startPrioritySubflow(idx);
  };

  const handleOptionSelect = async (option) => {
    setShowSubflowOptions(false);
    setMessages((prev) => [...prev, { type: "user", text: option.text }]);

    setTimeout(() => {
      setIsLoading(true);

      setTimeout(() => {
        if (option.skip) {
          setMessages((prev) => [...prev, { type: "bot", text: "Okay, let's skip that for now. Which priority would you like to focus on next?" }]);
          setCurrentPriorityIndex(-1);
          setAwaitingOptions('remainingPriorities');
        } else {
          const key = priorities[currentPriorityIndex].key;
          setSelectedClusters((prev) => ({
            ...prev,
            [key]: [...(prev[key] || []), ...(option.clusters || [])]
          }));

          if (currentSubStep < priorities[currentPriorityIndex].subflow.length - 1) {
            setCurrentSubStep(currentSubStep + 1);
            const nextStep = priorities[currentPriorityIndex].subflow[currentSubStep + 1];
            setMessages((prev) => [...prev, { type: "bot", text: nextStep.bot }]);
            setAwaitingOptions('subflow');
          } else {
            const newCompleted = new Set([...completedPriorities, key]);
            setCompletedPriorities(newCompleted);
            const nextPriorityIndex = priorities.findIndex(p => !newCompleted.has(p.key));

            if (nextPriorityIndex !== -1) {
              setCurrentPriorityIndex(nextPriorityIndex);
              setCurrentSubStep(0);
              const firstStep = priorities[nextPriorityIndex].subflow[0];
              setMessages((prev) => [...prev, { type: "bot", text: firstStep.bot }]);
              setAwaitingOptions('subflow');
            } else {
              const newModes = {};
              priorities.forEach(p => {
                newModes[p.key] = getMode(selectedClusters[p.key] || []);
              });
              setModes(newModes);
              setShowSummary(true);
              const summary = "Here are your selections:\n" + priorities.map(p => `${p.label}: ${clusterDescriptions[newModes[p.key]] || newModes[p.key]}`).join('\n') + "\n\nDo you want to proceed with the recommendation?";
              setMessages((prev) => [...prev, { type: "bot", text: summary }]);
            }
          }
        }
      }, 500);

    }, 800);
  };

  const handleFinalDecision = async (decision) => {
    setMessages((prev) => [...prev, { type: "user", text: decision }]);

    setTimeout(() => {
      if (!awaitingRestart) {
        if (decision === "yes") {
          setIsLoading(true);
          (async () => {
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
                  text: `Recommendation complete!\n\nRecommended Geotextile Type: ${result.predicted_type}\nConfidence: ${result.confidence}%\n\n${result.description}\n\nWould you like to test another material?`,
                },
              ]);
              setAwaitingRestart(true);
            } catch (err) {
              console.error(err);
              setMessages((prev) => [...prev, { type: "bot", text: "Error connecting to backend." }]);
            }
          })();
        } else {
          setIsLoading(true);
          setTimeout(() => {
            setMessages((prev) => [...prev, { type: "bot", text: "Okay! Thank you for using the Geo Assistant." }]);
          }, 500);
        }
      } else {
        setIsLoading(true);
        setTimeout(() => {
          if (decision === "yes") {
            setSelectedClusters({});
            setCurrentPriorityIndex(-1);
            setCurrentSubStep(0);
            const firstMessage = [{ type: "bot", text: "Hello! 👋 I’m your Geo Assistant. Ready to pick the right geotextile for your project?" }];
            setMessages(firstMessage);
            setDisplayedMessages(firstMessage);

            setAwaitingRestart(false);
            setShowPriorityOptions(false);
            setShowSummary(false);
            setModes({});
            setCompletedPriorities(new Set());

            setAwaitingOptions('initial');
          } else {
            setMessages((prev) => [...prev, { type: "bot", text: "Okay! Thank you for using the Geo Assistant." }]);
          }
        }, 500);
      }
    }, 800);
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: "#FFFFFF", // Changed to white
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
          '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><path d="M0 100 Q50 50 100 100 T200 100" stroke="#e0b3b3" stroke-width="1" fill="none" opacity="0.2"/><path d="M0 120 Q50 70 100 120 T200 120" stroke="#e0b3b3" stroke-width="1" fill="none" opacity="0.2"/></svg>'
        )}")`,
        backgroundRepeat: "repeat",
        color: LIGHT_TEXT_COLOR,
      }}
    >
      {showModelInfo ? (
        // --- FULLSCREEN MODEL INFO ---
        // This div mimics the parent's flex layout to fill the screen
        <div className="flex flex-col h-full" style={{ color: LIGHT_TEXT_COLOR, backgroundColor: "#FFFFFF" }}>
          {/* Info Header */}
          <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Geotextile Recommendation - Model Details</h2>
            <button
              onClick={() => setShowModelInfo(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          
          {/* Info Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Overview */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Overview</h3>
              <p className="text-gray-700 leading-relaxed">
                This AI-powered Geotextile Recommendation system uses an Artificial Neural Network (ANN) trained on a comprehensive dataset of geotextile material properties. The system recommends the most suitable geotextile type from 9 different categories based on 9 key physical properties, providing calibrated confidence scores for reliable decision-making in civil engineering applications.
              </p>
            </section>

            {/* Model Architecture */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Neural Network Architecture</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Network Structure:</h4>
                  <ul className="mt-3 space-y-1 text-sm text-gray-700">
                  <li><strong>Input Dimension:</strong> 42 features (9 properties × 5 clusters each, one-hot encoded)</li>
                  <li><strong>Hidden Layers:</strong> 2 fully connected layers with 64 and 32 neurons</li>
                  <li><strong>Activation:</strong> LeakyReLU (negative slope = 0.1) for hidden layers</li>
                  <li><strong>Regularization:</strong> Dropout (30% and 20%) to prevent overfitting</li>
                  <li><strong>Output:</strong> 9-class softmax classification</li>
                </ul>
              </div>
            </section>

            {/* --- NEW SECTION: Model Performance --- */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Model Performance</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Classification Metrics</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li><strong>Accuracy:</strong> 80.67%</li>
                    <li><strong>Precision:</strong> 80.67%</li>
                    <li><strong>Recall:</strong> 80.67%</li>
                    <li><strong>F1-Score:</strong> 75.42%</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Error Metrics</h4>
                  <ul className="space-y-1 text-sm text-green-700">
                    <li><strong>Loss (Categorical Cross-Entropy):</strong> 0.429</li>
                    <li><strong>RMSE (Root Mean Squared Error):</strong> 0.178</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Training Configuration */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Training Configuration</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Optimization</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li><strong>Loss Function:</strong> Categorical Cross-Entropy</li>
                    <li><strong>Optimizer:</strong> Adam (learning rate = 0.001)</li>
                    <li><strong>Batch Size:</strong> 16</li>
                    <li><strong>Max Epochs:</strong> 150 (with early stopping)</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Regularization</h4>
                  <ul className="space-y-1 text-sm text-green-700">
                    <li><strong>Early Stopping:</strong> Monitor val_loss, patience = 10</li>
                    <li><strong>LR Scheduler:</strong> Reduce on plateau, factor = 0.5, patience = 6</li>
                    <li><strong>Dropout:</strong> 30% and 20% in hidden layers</li>
                    <li><strong>Reproducibility:</strong> Fixed seeds (42)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Preprocessing Pipeline */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Data Preprocessing Pipeline</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">1. Expert-Defined Clustering</h4>
                  <p className="text-gray-700 text-sm mb-2">
                    Each of the 9 continuous features is discretized into 5 performance clusters (C1-C5):
                  </p>
                  <div className="grid md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-yellow-50 p-3 rounded">
                      <strong>Tensile Strength:</strong><br/>
                      C1: ≤30, C2: 31-60, C3: 61-120, C4: 121-200, C5: &gt;200 kN/m
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                      <strong>Puncture Resistance:</strong><br/>
                      C1: ≤600, C2: 601-1000, C3: 1001-1400, C4: 1401-1800, C5: &gt;1800 N
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                      <strong>Permittivity:</strong><br/>
                      C1: ≤0.2, C2: 0.21-0.5, C3: 0.51-1.0, C4: 1.01-1.5, C5: &gt;1.5 s⁻¹
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                      <strong>Filtration Efficiency:</strong><br/>
                      C1: ≤75%, C2: 76-85%, C3: 86-90%, C4: 91-95%, C5: &gt;95%
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                      <strong>Recycled Content:</strong><br/>
                      C1: 0%, C2: 1-30%, C3: 31-60%, C4: 61-99%, C5: 100%
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                      <strong>Biobased Content:</strong><br/>
                      C1: 0%, C2: 1-30%, C3: 31-70%, C4: 71-99%, C5: 100%
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                      <strong>UV Strength Retained:</strong><br/>
                      C1: ≤30%, C2: 31-50%, C3: 51-70%, C4: 71-85%, C5: &gt;85%
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                      <strong>Material Cost:</strong><br/>
                      C1: ≤₱100, C2: ₱101-200, C3: ₱201-400, C4: ₱401-700, C5: &gt;₱700/m²
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                      <strong>Installation Cost:</strong><br/>
                      C1: ≤₱50, C2: ₱51-100, C3: ₱101-200, C4: ₱201-350, C5: &gt;₱350/m²
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-2">2. One-Hot Encoding</h4>
                  <p className="text-gray-700 text-sm">
                    Cluster labels are converted to binary vectors, resulting in 42 input features (9 features × 5 clusters each).
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-2">3. Data Splitting</h4>
                  <p className="text-gray-700 text-sm">
                    Dataset split: 70% training, 15% validation, 15% testing with stratified sampling.
                  </p>
                </div>
              </div>
            </section>

            {/* Calibration */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Probability Calibration</h3>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">Platt Scaling</h4>
                <p className="text-purple-700 text-sm mb-2">
                  The model uses Platt scaling for reliable confidence scores:
                </p>
                <ul className="space-y-1 text-sm text-purple-700">
                  <li>• Fits logistic regression scalers on validation set logits</li>
                  <li>• Applies scalers to new recommendations for calibrated probabilities</li>
                  <li>• Ensures probabilities sum to 1 and provide accurate uncertainty estimates</li>
                </ul>
              </div>
            </section>

            {/* Dataset */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Dataset Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-medium text-indigo-800 mb-2">Statistics</h4>
                  <ul className="space-y-1 text-sm text-indigo-700">
                    <li><strong>Total Samples:</strong> 2000 geotextile entries</li>
                    <li><strong>Features:</strong> 9 physical properties</li>
                    <li><strong>Target Classes:</strong> 9 geotextile types</li>
                    <li><strong>Data Source:</strong> Various journals and studies</li>
                  </ul>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-medium text-indigo-800 mb-2">Geotextile Types</h4>
                  <ul className="space-y-1 text-sm text-indigo-700">
                    <li>• Recycled PET Nonwoven</li>
                    <li>• PET Woven</li>
                    <li>• Hybrid (PP+Coir)</li>
                    <li>• PP Woven</li>
                    <li>• Glass Fiber Composite</li>
                    <li>• PP Nonwoven</li>
                    <li>• Coir Woven</li>
                    <li>• PLA Nonwoven</li>
                    <li>• HDPE Grid</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Applications */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Applications</h3>
              <p className="text-gray-700 leading-relaxed">
                This recommendation system assists civil engineers and project managers in selecting optimal geotextile materials for various applications including soil stabilization, drainage systems, erosion control, retaining walls, road construction, and environmental protection projects. The AI recommendations help balance performance requirements with cost considerations and sustainability goals.
              </p>
            </section>

            {/* Technical Notes */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Technical Notes</h3>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-700 text-sm">
                  <strong>Note:</strong> This system is designed for research and educational purposes. For production use in critical engineering applications, additional validation, testing, and expert review should be performed. Always consult with qualified professionals for final material selection decisions.
                </p>
              </div>
            </section>
          </div>

          {/* NO FOOTER HERE */}
        </div>
      ) : (
        // --- CHAT INTERFACE ---
        <>
          {/* HEADER */}
          <div className="p-4 md:p-6 flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/maroon.png" alt="Geo Assistant Logo" className="w-10 h-10 md:w-12 md:h-12" style={{ objectFit: "cover" }} />
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold">Geotextile Recommendation</h1>
                <p className="text-sm md:text-base opacity-80" style={{ color: LIGHT_TEXT_COLOR }}>AI-Powered Geotextile Recommendation</p>
              </div>
            </div>
            <FaInfoCircle
              className="cursor-pointer text-lg"
              style={{ color: "#800000" }}
              onClick={() => setShowModelInfo(true)}
            />
          </div>

          {/* ---
          --- THIS IS THE FIX. The layout is now one single scrolling column.
          --- `id="chat-container"` is on this main div.
          --- */}
          <div id="chat-container" className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
            <motion.div
              // --- THIS IS THE CHANGE ---
              // Added flex-col and space-y to add gaps between messages
              className="flex flex-col space-y-4 md:space-y-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {displayedMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                  initial={i === 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div
                    className="no-select max-w-[85%] sm:max-w-[75%] md:max-w-[65%]"
                    style={{
                      backgroundColor: msg.type === "user" ? MAROON_COLOR : COMPONENT_BG_COLOR,
                      color: msg.type === "user" ? "#fff" : LIGHT_TEXT_COLOR,
                      padding: "0.75rem 1.25rem",
                      borderRadius: msg.type === "user" ? "1.5625rem 1.5625rem 0.3125rem 1.5625rem" : "1.5625rem 1.5625rem 1.5625rem 0.3125rem",
                      boxShadow: SHADOW_LIGHT,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* ---
            --- THE SECOND PART OF THE FIX ---
            --- This wrapper div prevents the "jump" by holding a minimum height.
            --- `flex flex-col justify-end` anchors the content to its bottom.
            --- */}
            <div
              className="w-full flex flex-col justify-end"
              style={{ minHeight: '9.375rem' }} // Adjust this height to fit your tallest grid
            >
              {/* All options and the typing indicator are now inside this wrapper */}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoading ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isLoading && <TypingIndicator />}
              </motion.div>

              {/* INITIAL YES/NO */}
              {showInitialOptions && !isLoading && (
                <motion.div
                  // --- FIX: Use w-full and grid-cols-1 by default ---
                  className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.05 } }
                  }}
                >
                  {[
                    { text: "Yes, let’s start", action: () => handleInitialDecision("Yes, let’s start") },
                    { text: "No", action: () => handleInitialDecision("No") }
                  ].map((option, idx) => (
                    <motion.div
                      key={idx}
                      onClick={option.action}
                      className="cursor-pointer py-4 px-3 rounded-lg shadow-md no-select"
                      style={{
                        backgroundColor: idx === 0 ? MAROON_COLOR : "#ccc",
                        color: idx === 0 ? "#fff" : "#000",
                      }}
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      whileTap={{ scale: 0.97, opacity: 0.8 }}
                    >
                      {/* --- FIX: Added text-center --- */}
                      <div className="text-center">{option.text === "Yes, let’s start" ? "Yes" : option.text}</div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* PRIORITY OPTIONS */}
              {showPriorityOptions && !isLoading && (
                <motion.div
                  // --- FIX: Use w-full and grid-cols-1 by default ---
                  className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1,
                      },
                    },
                  }}
                >
                  {priorities.map((priority, idx) => (
                    <motion.div
                      key={priority.key}
                      onClick={() => handlePrioritySelect(idx)}
                      // --- FIX: Logic updated to handle col-span on md screens ---
                      className={`cursor-pointer py-4 px-3 rounded-lg bg-white shadow-md no-select ${idx === priorities.length - 1 && priorities.length % 2 === 1 ? 'md:col-span-2' : ''}`}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      whileTap={{ scale: 0.97, opacity: 0.8 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      {/* --- FIX: Added text-center --- */}
                      <div className="text-center">{priority.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* REMAINING PRIORITY OPTIONS */}
              {showRemainingPriorities && !isLoading && (
                <motion.div
                  // --- FIX: Use w-full and grid-cols-1 by default ---
                  className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1,
                      },
                    },
                  }}
                >
                  {priorities.filter(p => !completedPriorities.has(p.key)).map((priority, idx, arr) => (
                    <motion.div
                      key={priority.key}
                      onClick={() => {
                        setShowRemainingPriorities(false);
                        const priorityIndex = priorities.findIndex(p => p.key === priority.key);
                        startPrioritySubflow(priorityIndex);
                      }}
                      // --- FIX: Logic updated to handle col-span on md screens ---
                      className={`cursor-pointer py-4 px-3 rounded-lg bg-white shadow-md no-select ${idx === arr.length - 1 && arr.length % 2 === 1 ? 'md:col-span-2' : ''}`}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      whileTap={{ scale: 0.97, opacity: 0.8 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      {/* --- FIX: Added text-center --- */}
                      <div className="text-center">{priority.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* SUBFLOW OPTIONS */}
              {currentPriorityIndex >= 0 &&
                currentPriorityIndex < priorities.length &&
                !isLoading &&
                !showSummary &&
                showSubflowOptions && (
                  <motion.div
                    // --- FIX: Use w-full and grid-cols-1 by default ---
                    className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: { transition: { staggerChildren: 0.05 } }
                    }}
                  >
                    {priorities[currentPriorityIndex].subflow[currentSubStep].options.map((option, idx) => {
                      const optionsLength = priorities[currentPriorityIndex].subflow[currentSubStep].options.length;
                      const isAsapOrFlexible = option.text === "ASAP" || option.text === "Flexible";
                      const isSmallSet = optionsLength <= 2;
                      return (
                        <motion.div
                          key={idx}
                          onClick={() => handleOptionSelect(option)}
                          // --- FIX: Logic updated to handle col-span on md screens ---
                          className={`cursor-pointer py-4 px-3 rounded-lg shadow-md no-select ${optionsLength === 1 ? 'col-span-1 md:col-span-2' : ''} ${idx === optionsLength - 1 && optionsLength % 2 === 1 ? 'col-span-1 md:col-span-2' : ''}`}
                          style={{
                            backgroundColor: isAsapOrFlexible ? "#fff" : isSmallSet ? (idx === 0 ? MAROON_COLOR : "#ccc") : "#fff",
                            color: isAsapOrFlexible ? "#000" : isSmallSet ? (idx === 0 ? "#fff" : "#000") : "#000",
                          }}
                          variants={{
                            hidden: { opacity: 0, y: 10 },
                            visible: { opacity: 1, y: 0 }
                          }}
                          whileTap={{ scale: 0.97, opacity: 0.8 }}
                        >
                          {/* --- FIX: Added text-center --- */}
                          <div className="text-center">{option.text === "Yes, let’s start" ? "Yes" : option.text === "Not now" ? "No" : option.text}</div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}

              {/* FINAL YES/NO */}
              {showSummary && !isLoading && (
                <motion.div
                  // --- FIX: Use w-full and grid-cols-1 by default ---
                  className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.05 } }
                  }}
                >
                  {[
                    { text: "Yes", action: () => handleFinalDecision("yes") },
                    { text: "No", action: () => handleFinalDecision("no") }
                  ].map((option, idx) => (
                    <motion.div
                      key={idx}
                      onClick={option.action}
                      className="cursor-pointer py-4 px-3 rounded-lg shadow-md no-select font-bold"
                      style={{
                        backgroundColor: idx === 0 ? MAROON_COLOR : "#ccc",
                        color: idx === 0 ? "#fff" : "#000",
                      }}
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      whileTap={{ scale: 0.97, opacity: 0.8 }}
                    >
                      {/* --- FIX: Added text-center --- */}
                      <div className="text-center">{option.text}</div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div> {/* --- End of min-height wrapper --- */}
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;