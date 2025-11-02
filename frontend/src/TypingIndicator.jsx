import { motion } from "framer-motion";

const TypingIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex justify-start"
    >
      <div
        style={{
          backgroundColor: "#F5F5F5",
          color: "#000000",
          padding: "12px 20px",
          borderRadius: "25px 25px 25px 5px",
          boxShadow: "0 3px 10px rgba(69, 2, 2, 0.65)",
          maxWidth: "65%",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
          style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#000" }}
        />
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#000" }}
        />
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
          style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#000" }}
        />
      </div>
    </motion.div>
  );
};

export default TypingIndicator;
