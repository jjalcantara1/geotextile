import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TypingIndicator from "./TypingIndicator";
import ChoiceSet from "./ChoiceSet"; // Assuming these are in your project
import ChatBubble from "./ChatBubble"; // Assuming these are in your project

// --- Theme Constants ---
const GLOBAL_BG_COLOR = "#f2f0f0ff";
const COMPONENT_BG_COLOR = "#F5F5F5";
const LIGHT_TEXT_COLOR = "#000000";
const MAROON_COLOR = "#efc0c0ff";
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

// --- Priorities and Subflows (All Syntax Errors Corrected) ---
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
  const [messages, setMessages] = useState([]); // Start empty
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [selectedClusters, setSelectedClusters] = useState({}); // {key: [[step0 clusters], [step1 clusters], ...]}
  const [currentPriorityIndex, setCurrentPriorityIndex] = useState(-2); // -2 = Booting
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [awaitingRestart, setAwaitingRestart] = useState(false);
  const [showPriorityOptions, setShowPriorityOptions] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [modes, setModes] = useState({});
  const [completedPriorities, setCompletedPriorities] = useState(new Set());
  const [showRemainingPriorities, setShowRemainingPriorities] = useState(false);

  const [optionsHeight, setOptionsHeight] = useState(0);
  
  const chatContainerRef = useRef(null);
  const optionsFooterRef = useRef(null);
  const messagesEndRef = useRef(null); // Ref to scroll to

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // --- STARTUP SEQUENCE ---
  useEffect(() => {
    setIsLoading(true); // 1. Show typing
    const t1 = setTimeout(() => {
      setIsLoading(false); // 2. Hide typing
      setMessages([{ type: "bot", text: "Hello! 👋 I’m your Geo Assistant. Ready to pick the right geotextile for your project?" }]);
    }, 1500);
    const t2 = setTimeout(() => {
      setCurrentPriorityIndex(-1); // 3. Show "Yes/No"
    }, 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []); // Run only on mount

  // --- SCROLL-TO-BOTTOM HOOK ---
  useEffect(() => {
    // Scroll when new messages are displayed OR when the options height changes
    // We add a delay to let the padding-bottom transition finish *before* scrolling
    const timerId = setTimeout(scrollToBottom, 300);
    return () => clearTimeout(timerId);

  }, [displayedMessages.length, optionsHeight]); // <-- DEPENDS ON BOTH
  
  // --- FOOTER HEIGHT MEASUREMENT HOOK ---
  useEffect(() => {
    const measureFooter = () => {
      if (optionsFooterRef.current) {
        setOptionsHeight(optionsFooterRef.current.clientHeight);
      } else {
        setOptionsHeight(0);
      }
    };
    
    // We measure after a slight delay to let framer-motion render
    const timerId = setTimeout(measureFooter, 50);
    
    return () => clearTimeout(timerId);
  }, [
    showPriorityOptions,
    showRemainingPriorities,
    currentPriorityIndex,
    currentSubStep,
    showSummary,
    isLoading
  ]);

  // --- MESSAGE DISPLAY HOOK ---
  useEffect(() => {
    if (messages.length > displayedMessages.length) {
      const nextMessage = messages[displayedMessages.length];
      if (nextMessage.type === "bot") {
        setIsLoading(true);
        const timeout = setTimeout(() => {
          setIsLoading(false);
          setDisplayedMessages((prev) => [...prev, nextMessage]);
        }, 800); // Reduced for smoother feel
        return () => clearTimeout(timeout);
      } else {
        setDisplayedMessages((prev) => [...prev, nextMessage]);
      }
    }
  }, [messages, displayedMessages]);

  // --- HANDLER FUNCTIONS ---
  const getMode = (clusters) => {
    if (!clusters || clusters.length === 0) return 'C3';
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
    setCurrentPriorityIndex(-2);
    setMessages((prev) => [...prev, { type: "user", text: decision }]);

    if (decision === "Yes, let’s start") {
      setMessages((prev) => [...prev, { type: "bot", text: "Awesome. Which do you want to prioritize first?" }]);
      setTimeout(() => {
        scrollToBottom();
        setShowPriorityOptions(true);
      }, 800);
    } else {
      setMessages((prev) => [...prev, { type: "bot", text: "Okay! Thank you for using the Geo Assistant." }]);
    }
  };

  const handlePrioritySelect = (idx) => {
    setMessages((prev) => [...prev, { type: "user", text: priorities[idx].label }]);
    setCurrentPriorityIndex(idx);
    setCurrentSubStep(0);
    setShowPriorityOptions(false);
    setShowRemainingPriorities(false);
    
    const firstStep = priorities[idx].subflow[0];
    setMessages((prev) => [...prev, { type: "bot", text: firstStep.bot }]);
  };

  const handleOptionSelect = async (option) => {
    setMessages((prev) => [...prev, { type: "user", text: option.text }]);
    
    if (option.skip) {
      setMessages((prev) => [...prev, { type: "bot", text: "Okay, let's skip that for now. Which priority would you like to focus on next?" }]);
      setCurrentPriorityIndex(-1);
      setCurrentSubStep(0);
      setShowRemainingPriorities(true);
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
      } else {
        const newCompleted = new Set([...completedPriorities, key]);
        setCompletedPriorities(newCompleted);
        
        const nextPriorityIndex = priorities.findIndex(p => !newCompleted.has(p.key));

        if (nextPriorityIndex === -1) {
          const newModes = {};
          priorities.forEach(p => {
            newModes[p.key] = getMode(selectedClusters[p.key] || []);
          });
          setModes(newModes);
          setCurrentPriorityIndex(-1);
          setShowSummary(true);
          const summary = "Here are your selections:\n" + priorities.map(p => `${p.label}: ${clusterDescriptions[newModes[p.key]] || newModes[p.key]}`).join('\n') + "\n\nDo you want to proceed with the prediction?";
          setMessages((prev) => [...prev, { type: "bot", text: summary }]);
        } else {
          setCurrentPriorityIndex(nextPriorityIndex);
          setCurrentSubStep(0);
          const firstStep = priorities[nextPriorityIndex].subflow[0];
          setMessages((prev) => [...prev, { type: "bot", text: `Great. Now, for ${priorities[nextPriorityIndex].label}:\n\n${firstStep.bot}` }]);
        }
      }
    }
  };

  const handleFinalDecision = async (decision) => {
    setShowSummary(false);
    setMessages((prev) => [...prev, { type: "user", text: decision }]);
    
    if (!awaitingRestart) {
      if (decision === "yes") {
        setIsLoading(true);
        try {
          const fakeApiCall = () => new Promise(resolve => setTimeout(() => {
            resolve({
              predicted_type: "Woven Geotextile (W-G)",
              confidence: 92.5,
              description: "Recommended for projects needing high tensile strength and puncture resistance."
            });
          }, 1500));
          const result = await fakeApiCall();
          
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: `Prediction complete!\n\nPredicted Geotextile Type: ${result.predicted_type}\nConfidence: ${result.confidence}%\n\n${result.description}\n\nWould you like to test another material?`,
            },
          ]);
          setAwaitingRestart(true);
          setShowSummary(true);
        } catch (err) {
          console.error(err);
          setMessages((prev) => [...prev, { type: "bot", text: "Error connecting to backend." }]);
          setIsLoading(false);
        }
      } else {
        setMessages((prev) => [...prev, { type: "bot", text: "Okay! Thank you for using the Geo Assistant." }]);
        setCurrentPriorityIndex(-2);
      }
    } else {
      // Restart logic
      setShowSummary(false);
      if (decision === "yes") {
        setSelectedClusters({});
        setCurrentPriorityIndex(-2);
        setCurrentSubStep(0);
        setDisplayedMessages([]);
        setMessages([]);
        setAwaitingRestart(false);
        setShowPriorityOptions(false);
        setModes({});
        setCompletedPriorities(new Set());

        setIsLoading(true);
        const t1 = setTimeout(() => {
          setIsLoading(false);
          setMessages([{ type: "bot", text: "Hello! 👋 I’m your Geo Assistant. Ready to pick the right geotextile for your project?" }]);
        }, 1500);
        const t2 = setTimeout(() => {
          setCurrentPriorityIndex(-1);
        }, 2000);
      } else {
        setMessages((prev) => [...prev, { type: "bot", text: "Okay! Thank you for using the Geo Assistant." }]);
        setCurrentPriorityIndex(-2);
      }
    }
  };
  
  // --- Animation Variants for Framer Motion ---
  const optionsVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: 30, transition: { duration: 0.2, ease: "easeIn" } }
  };
  
  // --- This function determines WHAT to render in the footer ---
  const renderOptions = () => {
    let content = null;
    
    // 1. Loading Indicator
    if (isLoading && !showSummary) {
       content = (
         <motion.div
           key="loading"
           className="p-6"
           variants={optionsVariants}
           initial="hidden"
           animate="visible"
           exit="exit"
         >
           <TypingIndicator />
         </motion.div>
       );
    }
    // 2. Initial "Yes/No"
    else if (currentPriorityIndex === -1 && !showPriorityOptions && !showRemainingPriorities && !showSummary) {
      content = (
        <motion.div
          key="initial"
          className="flex justify-center space-x-4 p-6"
          variants={optionsVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
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
        </motion.div>
      );
    }
    // 3. Priority List
    else if (showPriorityOptions) {
      content = (
        <motion.div
          key="priority"
          className="grid grid-cols-1 md:grid-cols-2 gap-3 p-6"
          variants={optionsVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {priorities.map((priority, idx) => (
            <div
              key={priority.key}
              onClick={() => handlePrioritySelect(idx)}
              className={`w-full cursor-pointer py-4 px-3 rounded-lg bg-white shadow-md ${
                (idx === priorities.length - 1 && priorities.length % 2 !== 0) ? 'md:col-span-2' : ''
              }`}
            >
              <div className="font-semibold">{priority.label}</div>
            </div>
          ))}
        </motion.div>
      );
    }
    // 4. Remaining Priorities
    else if (showRemainingPriorities) {
      const remaining = priorities.filter(p => !completedPriorities.has(p.key));
      content = (
        <motion.div
          key="remaining"
          className="grid grid-cols-1 md:grid-cols-2 gap-3 p-6"
          variants={optionsVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {remaining.map((priority, idx) => (
            <div
              key={priority.key}
              onClick={() => {
                const priorityIndex = priorities.findIndex(p => p.key === priority.key);
                handlePrioritySelect(priorityIndex);
              }}
              className={`w-full cursor-pointer py-4 px-3 rounded-lg bg-white shadow-md ${
                (idx === remaining.length - 1 && remaining.length % 2 !== 0) ? 'md:col-span-2' : ''
              }`}
            >
              <div className="font-semibold">{priority.label}</div>
            </div>
          ))}
        </motion.div>
      );
    }
    // 5. Subflow Options
    else if (currentPriorityIndex >= 0 && !showSummary) {
      const subOptions = priorities[currentPriorityIndex].subflow[currentSubStep].options;
      content = (
        <motion.div
          key={`subflow-${currentPriorityIndex}-${currentSubStep}`}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 p-6"
          variants={optionsVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {subOptions.map((option, idx) => (
            <div
              key={idx}
              onClick={() => handleOptionSelect(option)}
              className={`w-full cursor-pointer py-4 px-3 rounded-lg bg-white shadow-md ${
                (idx === subOptions.length - 1 && subOptions.length % 2 !== 0) ? 'md:col-span-2' : ''
              }`}
            >
              <div className="font-semibold">{option.text}</div>
            </div>
          ))}
        </motion.div>
      );
    }
    // 6. Summary Buttons
    else if (showSummary) {
      content = (
         <motion.div
          key="summary"
          className="flex justify-center space-x-4 p-6"
          variants={optionsVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <button
            onClick={() => handleFinalDecision("yes")}
            className="px-6 py-2 rounded-lg font-bold"
            style={{ backgroundColor: MAROON_COLOR, color: "#fff" }}
          >
            {awaitingRestart ? "Yes, Restart" : "Yes, Predict"}
          </button>
          <button
            onClick={() => handleFinalDecision("no")}
            className="px-6 py-2 rounded-lg font-bold"
            style={{ backgroundColor: "#ccc", color: "#000" }}
          >
            No
          </button>
        </motion.div>
      );
    }

    // This wrapper div is measured by the ref
    return <div ref={optionsFooterRef}>{content}</div>;
  };

  return (
    // --- LAYOUT FIX: Parent is relative and overflow-hidden ---
    <div
      className="flex flex-col h-full relative overflow-hidden" 
      style={{
        backgroundColor: GLOBAL_BG_COLOR,
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
          '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><path d="M0 100 Q50 50 100 100 T200 100" stroke="#e0b3b3" stroke-width-1" fill="none" opacity="0.2"/><path d="M0 120 Q50 70 100 120 T200 120" stroke="#e0b3b3" stroke-width-1" fill="none" opacity="0.2"/></svg>'
        )}")`,
        backgroundRepeat: "repeat",
        color: LIGHT_TEXT_COLOR,
      }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out forwards;
          }
        `}
      </style>
      {/* HEADER */}
      <div className="p-6 flex items-center justify-start space-x-4 flex-shrink-0">
        <img src="/maroon.png" alt="Geo Assistant Logo" className="w-12 h-12" style={{ objectFit: "cover" }} />
        <div className="text-left">
          <h1 className="text-3xl font-bold">Geotextile Classifier</h1>
          <p className="text-base opacity-80" style={{ color: LIGHT_TEXT_COLOR }}>AI-Powered Geotextile Recommendation</p>
        </div>
      </div>

      {/* CHAT CONTAINER (SCROLLABLE HISTORY) */}
      <div 
        id="chat-container" 
        ref={chatContainerRef} 
        // --- LAYOUT FIX: Chat starts at the top, has dynamic padding ---
        className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col"
        style={{ 
          // Dynamic padding to prevent options from hiding last message
          paddingBottom: `${optionsHeight}px`,
          // Smooth the padding change
          transition: "padding-bottom 0.3s ease-out" 
        }}
      >
        {displayedMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} animate-fadeIn flex-shrink-0`}>
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
        {/* This div is the new scroll target */}
        <div ref={messagesEndRef} style={{ height: "1px" }} />
      </div>
      
      {/* --- SLIDING OPTIONS FOOTER --- */}
      <div 
        // --- LAYOUT FIX: Absolute position, slides over chat ---
        className="absolute bottom-0 left-0 right-0"
        style={{ 
          maxHeight: "70vh", 
          overflowY: "auto",
          // Faded background to look "cleaner"
          background: "linear-gradient(to top, rgba(242, 240, 240, 1) 70%, rgba(242, 240, 240, 0))"
        }}
      >
        {/* This inner div is measured for the padding */}
        <div ref={optionsFooterRef}> 
          <AnimatePresence mode="wait">
            {renderOptions()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;

