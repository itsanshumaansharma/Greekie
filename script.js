let prompts = document.querySelector('#prompt');
let chatContainer = document.querySelector('.chat-container');
let newChatBtn = document.querySelector('#newChatbtn');
let submitBtn = document.querySelector('#submit');
let imageBtn = document.querySelector('#image');
let imageInput = document.querySelector('#image input');

// Setting word limit
function wordLimit() {
    let word = prompts.value.trim();
    let wordCount = word.split(/\s+/); // handles multiple spaces/tabs/newlines
    let count = 0;
    for (let i = 0; i < wordCount.length; i++) {
        count++;
    }

    if (count > 3000) {
        alert("Word is less than 3000, Please reduce the number of words");
        prompts.value = "";
        prompts.style.height = 'auto';
    }
}

// Auto Resize the prompt area when the user write or paste the large text
function autoResizeTextarea() {
    prompts.style.height = 'auto';
    prompts.style.height = `${prompts.scrollHeight}px`;
}

//Creating a new Chat Function
let newChat = () => {
    chatContainer.innerHTML = `<div class="ai-chat-box">
            <!-- It is implemented dynamically through JavaScript -->
            <img src="chatbot.png" alt="" id="aiImage" width="50">
            <div class="ai-chat-area">
                <h3>Welcome to <i class="fa-brands fa-slack"></i> Greekie</h3>
                <p>Ask me anything — from creative writing to coding help and more.</p>
            </div>
        </div>`;
    prompts.value = "";
    prompts.style.height = 'auto';
    // This is for reset the image button for normal
    imageBtn.innerHTML = `<button id="image"><i class="fa-solid fa-image"></i><input type="file" accept="images/*" hidden></button>`;

    //This is for the removing 
    user.file = {};
    
}


// This function format the text in good manner
// I have taken this code from chatGpt for formatting the text in proper way
function formatMessageText(text) {
    // Replace code blocks first
    let formattedText = text.replace(/```(\w*)\n([\s\S]*?)```/g,
        '<pre><code class="$1">$2</code></pre>');

    // Replace inline code
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Replace markdown links
    formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Replace bold
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Replace italic (single * or _)
    formattedText = formattedText.replace(/(^|[^*])\*(?!\s)([^*]+?)\*(?!\*)/g, '$1<em>$2</em>');

    // Replace bullet point * with • (only at line starts)
    formattedText = formattedText.replace(/(^|\n)\s*\*\s+/g, '$1• ');

    // Replace newlines with <br>
    formattedText = formattedText.replace(/\n/g, '<br>');

    return formattedText;
}


// Api Quick Start Guide: 
// curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=GEMINI_API_KEY" \
// -H 'Content-Type: application/json' \ // It means headers 
// -X POST \ //It means Method Post
// -d '{
//   "contents": [{
//     "parts":[{"text": "Explain how AI works"}]
//     }]
//    }' // It is body in json format

// API Configuration (Consider using environment variables in production)
const API_KEY = "AIzaSyBZdDngL6phB3pQCE8wCL0CgKdjrVVCwak";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Object for data 
let user = {
    //Text as an input
    message: null,

    //Images as an input
    file: {
        mime_type: null,
        data: null
    }
}

// Fetching Api Data Function
let generateResponse = async (aiChatBox) => {

    // Accessing ChatBox Area
    let text = aiChatBox.querySelector(".ai-chat-area");

    // Object for API format for transfering message or data from user 
    let RequestOption = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "contents": [{
                "parts": [{ "text": user.message }, (user.file.data ? [{ "inline_data": user.file }] : [])]
            }]
        })
    };

    try {
        //Fetching Api....
        let response = await fetch(API_URL, RequestOption);
        let data = await response.json();
        let apiResponse = data.candidates[0].content.parts[0].text.trim();
        // console.log(apiResponse);

        //Transfering API response data to as a message according to user inputs 
        text.innerHTML = formatMessageText(apiResponse); //This function format the text in good manner

        // console.log(data);
        // Get Response Ouput in the form of JSON Object;
        // {
        //     "candidates": [
        //       {
        //         "avgLogprobs": -0.0011340594765814867,
        //         "content": {
        //           "parts": [
        //             {
        //               "text": "Hi there! How can I help you today?\n" // 👈 Model's reply
        //             }
        //           ]
        //         },
        //         "role": "model",
        //         "finishReason": "STOP"
        //       }
        //     ],
        //     "modelVersion": "gemini-2.0-flash",
        //     "usageMetadata": {
        //       "promptTokenCount": 1,
        //       "candidatesTokenCount": 11,
        //       "totalTokenCount": 12,
        //       "promptTokensDetails": [ /* token-level detail here */ ],
        //       "candidatesTokensDetails": [ /* token-level detail here */ ]
        //     }
        //   }


    }
    catch (error) {
        console.log(error);

    }
    finally {
        // It is uses for automatic scroll when the Api response the datas 
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

        // This is for reset the image button for normal
        imageBtn.innerHTML = `<button id="image"><i class="fa-solid fa-image"></i><input type="file" accept="images/*" hidden></button>`;

        //This is for the removing 
        user.file = {};

    }

}


// User Input and AI output create Message Function
let createChatBox = (html, classes) => {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

// User Input Shows Message Function
let handlechatResponse = (message) => {
    user.message = message;
    // User chat box creating
    let html = `<img src="user.png" alt="" id="userImage" width="50">
            <div class="user-chat-area">
                ${user.message}
                ${user.file.data?`<img src="data: ${user.file.mime_type}; base64,${user.file.data}" class="chooseImg" />` : ""}
            </div>`

    prompts.value = "";
    prompts.style.height = 'auto';

    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);

    // It is uses for automatic scroll when the user enter the datas 
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" })

    // AI chat box creating
    setTimeout(() => {
        let html = `<img src="chatbot.png" alt="" id="aiImage" width="50">
        <div class="ai-chat-area">
            <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
            </div>
        </div>`

        let aiChatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 600);
}


// -------------------------Event Listener---------------------------------------
// It handles the user input message
prompts.addEventListener("keydown", (e) => {
    //If press Enter Button 
    if (e.key == "Enter" && !e.shiftKey) {
        if (prompts.value.trim() == "") {
            e.preventDefault(); // It is used to default the enter button function 
            return;
        } else {
            e.preventDefault();
            // console.log(prompts.value);
            handlechatResponse(prompts.value);
        }
    }
    // console.log(e.key);
});

// It reset to new chat
newChatBtn.addEventListener('click', newChat);

// Auto Resize the prompt area when the user write the large text
prompts.addEventListener('input', autoResizeTextarea);

// Auto Resize the prompt area when the user paste the large text
prompts.addEventListener('paste', autoResizeTextarea);


// Submit Chat message
submitBtn.addEventListener('click', (e) => {
    if (prompts.value.trim() == "") {
        e.preventDefault();
        return;
    } else {
        e.preventDefault();
        // console.log(prompts.value);
        handlechatResponse(prompts.value);
    }
})

// Word Limit Alert
prompts.addEventListener('input', wordLimit);



// User input as an images
imageBtn.addEventListener('click', () => {
    imageInput.click();
})


// Change or Read images as file type and base64
imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) {
        return;
    }

    // Using file reader class 
    let reader = new FileReader();
    reader.onload = (e) => {
        // console.log(e); //Shows the object image as a object
        let base64string = e.target.result.split(",")[1];
        user.file = {
            mime_type: file.type,
            data: base64string
        }

        //This shows the image in image button after choosing
        imageBtn.innerHTML = `${user.file.data?`<img src="data: ${user.file.mime_type}; base64,${user.file.data}" class="chooseImgAdjust" />` : ""}`;

    }
    reader.readAsDataURL(file);
})