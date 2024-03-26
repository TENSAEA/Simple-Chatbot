import React, { useState, useRef, useEffect } from "react";

function Basic() {
  const [chat, setChat] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const [theme, setTheme] = useState("light");
  const scrollViewRef = useRef();

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTop = scrollViewRef.current.scrollHeight;
    }
  }, [chat]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const name = "Tensae";
    const request_temp = { sender: "user", sender_id: name, msg: inputMessage };

    if (inputMessage !== "") {
      setChat((chat) => [...chat, request_temp]);
      setBotTyping(true);
      setInputMessage("");
      rasaAPI(name, inputMessage);
    } else {
      alert("Please enter a valid message!");
    }
  };

  const rasaAPI = async (name, msg) => {
    try {
      // Sending the user's message to your chatbot backend
      const response = await fetch(
        "http://localhost:5005/webhooks/rest/webhook",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            charset: "UTF-8",
          },
          body: JSON.stringify({ sender: name, message: msg }),
        }
      );

      // Receiving the chatbot's response
      const data = await response.json();
      if (data) {
        const temp = data[0];
        const recipient_id = temp.recipient_id;
        const recipient_msg = temp.text;

        // Add initial bot response to indicate typing
        const typingResponse = {
          sender: "bot",
          recipient_id: recipient_id,
          msg: "",
        };
        setChat((chat) => [...chat, typingResponse]);
        setBotTyping(true);

        // Function to update the chat with the next character
        const updateMessage = (charIndex) => {
          if (charIndex < recipient_msg.length) {
            // Update the last message in the chat array
            setChat((prevChat) => {
              const updatedChat = [...prevChat];
              const lastMessageIndex = updatedChat.length - 1;
              updatedChat[lastMessageIndex].msg = recipient_msg.substring(
                0,
                charIndex + 1
              );
              return updatedChat;
            });

            // Schedule the next update
            setTimeout(() => updateMessage(charIndex + 1), 100); // Adjust typing speed here
          } else {
            // Typing is complete
            setBotTyping(false);
          }
        };

        // Start typing
        updateMessage(0);
      }
    } catch (error) {
      console.error("Error in rasaAPI:", error);
    }
  };

  return (
    <div style={styles.container(theme)}>
      <button onClick={toggleTheme} style={styles.themeButton(theme)}>
        {theme === "light" ? "Dark Mode" : "Light Mode"}
      </button>
      <div style={styles.card(theme)}>
        <div style={styles.cardHeader(theme)}>
          <h2 style={styles.headerText}>Vocabulary Building Chatbot</h2>
          {botTyping && <p style={styles.typingText}>Bot is typing...</p>}
        </div>
        <div ref={scrollViewRef} style={styles.cardBody}>
          {chat.map((message, index) =>
            message.sender === "bot" ? (
              <div key={index} style={styles.botMessage}>
                <p style={styles.botText(theme)}>{message.msg}</p>
              </div>
            ) : (
              <div key={index} style={styles.userMessage}>
                <p style={styles.userText(theme)}>{message.msg}</p>
              </div>
            )
          )}
        </div>
        <div style={styles.inputContainer}>
          <input
            style={styles.textInput(theme)}
            placeholder="Type message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <button onClick={handleSubmit} style={styles.sendButton}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: (theme) => ({
    backgroundColor: theme === "light" ? "#e6e6e6" : "black",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    padding: "20px",
  }),
  themeButton: (theme) => ({
    padding: 10,
    borderWidth: 2,
    borderRadius: 10,
    marginHorizontal: 100,
    marginTop: 20,
    marginBottom: 20,
    fontWeight: "bold",
    backgroundColor: theme === "light" ? "black" : "white",
    color: theme === "light" ? "#e6e6e6" : "black",
    cursor: "pointer", // for desktop
  }),
  card: (theme) => ({
    backgroundColor: theme === "light" ? "white" : "#1e1e1e",
    width: "40%", // Adjusted for desktop
    maxWidth: "600px", // Max width for larger screens
    borderRadius: 32,
    boxShadow: "0 16px 20px #000",
    borderWidth: 2,
    borderColor: theme === "light" ? "blue" : "white",
    padding: "20px",
    margin: "20px",
    display: "flex",
    flexDirection: "column",
  }),
  cardHeader: (theme) => ({
    height: "60px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: theme === "light" ? "#10246B" : "black",
  }),
  headerText: {
    fontSize: "24px",
    color: "white",
    fontWeight: "bold",
  },
  typingText: {
    fontSize: "14px",
    color: "white",
    marginLeft: "15px",
  },
  cardBody: {
    maxHeight: "400px", // Adjusted for desktop
    overflowY: "auto",
    padding: "10px",
  },
  botMessage: {
    display: "flex",
    alignItems: "center",
    margin: "10px",
  },
  botText: (theme) => ({
    color: theme === "light" ? "black" : "white",
    fontSize: "16px",
    marginLeft: "5px",
  }),
  userMessage: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    margin: "10px",
  },
  userText: (theme) => ({
    color: theme === "light" ? "black" : "white",
    fontSize: "16px",
    marginRight: "5px",
  }),
  inputContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px",
  },
  textInput: (theme) => ({
    flex: 1,
    marginRight: "10px",
    backgroundColor: theme === "light" ? "#e6e6e6" : "#5f5959",
    borderRadius: "20px",
    padding: "10px",
    color: theme === "light" ? "black" : "white",
  }),
  sendButton: {
    backgroundColor: "yellow",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "10px",
    cursor: "pointer", // for desktop
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
};

export default Basic;
