import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getIncomeTipsAndLocations = async (
  job: string,
  location: { lat: number; lng: number }
) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `I am a ${job} gig worker. 
      1. Suggest specific areas or types of locations nearby (lat: ${location.lat}, lng: ${location.lng}) where income efficiency is higher.
      2. Provide 3 specific tips to increase income.
      3. List 3 important 'Rules of the Profession' I should follow for safety and success.
      Format the response clearly with headings.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: location.lat,
              longitude: location.lng,
            },
          },
        },
      },
    });
    
    return {
      text: response.text,
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error) {
    console.error("Error fetching income tips:", error);
    return { text: "Unable to retrieve location-based tips at this time.", grounding: [] };
  }
};

export const getHealthAdvice = async (
  job: string,
  schedule: string,
  userQuery: string,
  history: { role: string; parts: { text: string }[] }[]
) => {
  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `You are a specialized Health Coach for a gig worker who works as a ${job}. 
        Their typical schedule is: "${schedule}".
        Analyze their health conditions based on this schedule (e.g., if they work nights, focus on sleep/vitamin D). 
        Provide concise, actionable health tips.`,
      },
      history: history,
    });

    const result = await chat.sendMessage({ message: userQuery });
    return result.text;
  } catch (error) {
    console.error("Error fetching health advice:", error);
    return "I'm having trouble connecting to the health database right now.";
  }
};

export const analyzeHealthImage = async (
  base64Image: string,
  mimeType: string,
  query: string
) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: query || "Analyze this image and provide health/first-aid advice if it shows an injury or health issue. If it's a food item, estimate nutrition."
          }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "I couldn't analyze the image. Please try again.";
  }
};

export const generateSchedule = async (job: string, todayGoal: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `I am a ${job}. My goal for today is: "${todayGoal}".
      Create a realistic, hour-by-hour schedule for today that helps me achieve this goal efficiently.
      Include breaks and safety checks.
      Format it as a clean list or timeline.`
    });
    return response.text;
  } catch (error) {
    console.error("Error generating schedule:", error);
    return "Could not generate a schedule at this time.";
  }
};

// --- JOB ASSISTANT FEATURES ---

export const getJobAdvice = async (
  job: string,
  userQuery: string,
  history: { role: string; parts: { text: string }[] }[]
) => {
  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `You are a Career and Dispute Resolution Expert for gig workers (e.g., Uber, DoorDash, Upwork).
        The user is a ${job}.
        Help them with:
        1. Resolving app bans, account deactivations, or payment disputes.
        2. Writing appeals for unfair low ratings.
        3. Tips for job applications and resume improvements for gig platforms.
        4. Navigating platform policies.
        Keep answers professional, supportive, and actionable.`,
      },
      history: history,
    });

    const result = await chat.sendMessage({ message: userQuery });
    return result.text;
  } catch (error) {
    console.error("Error fetching job advice:", error);
    return "I'm having trouble connecting to the job support system right now.";
  }
};

export const getGigOpportunities = async (userProfile: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Suggest 4 high-potential gig job opportunities or platforms suitable for a "${userProfile}".
      For each, provide:
      - Title/Role
      - Platform Name (e.g., Uber, TaskRabbit, Upwork)
      - Estimated Monthly Income (in Rupees)
      - A short description
      - Key Requirements`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              platform: { type: Type.STRING },
              income: { type: Type.STRING },
              description: { type: Type.STRING },
              requirements: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Error fetching opportunities:", e);
    return [];
  }
};

// --- EFFICIENCY EXPERT FEATURES ---

export const getEfficiencyInsights = async (job: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `I am a ${job}. Provide a strategic analysis to maximize my income and work efficiency.
      Focus on:
      1. Seasonal/Time-based Opportunities: What specific services/products/routes are most profitable right now or in the upcoming season? (e.g., for a Chef: seasonal menus; for a Driver: specific event types).
      2. Efficiency Hacks: Concrete methods to reduce time/effort per task.
      3. High-Value Actions: Specific things I can do to trigger higher tips or rates.
      
      Response MUST be valid JSON with this structure:
      {
        "seasonalTips": "string paragraph",
        "efficiencyHacks": ["string", "string", "string"],
        "incomeBoosters": ["string", "string", "string"]
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            seasonalTips: { type: Type.STRING },
            efficiencyHacks: { type: Type.ARRAY, items: { type: Type.STRING } },
            incomeBoosters: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching efficiency insights:", error);
    return null;
  }
};

// --- EMPOWERMENT & RIGHTS FEATURES ---

export const getEmpowermentResources = async (job: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `I am a ${job} gig worker.
      Provide a list of 4 organizations, unions, government bodies, or legal aid clinics I can contact if my rights are violated (e.g., wage theft, unfair termination, harassment).
      Focus on India-specific or Global resources relevant to gig work.
      
      Response MUST be valid JSON with this structure:
      [
        {
          "name": "Organization Name",
          "type": "Union / Government / Legal Aid",
          "description": "What they help with",
          "contact": "Phone number, email, or website (if not known, say 'Search online')"
        }
      ]`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING },
              description: { type: Type.STRING },
              contact: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error fetching empowerment resources:", error);
    return [];
  }
};

// --- NOTEBOOK & STUDY FEATURES ---

export const generateStudyMaterials = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following text and generate study materials.
      Text: "${text.substring(0, 30000)}" 
      
      Output JSON with:
      1. mindMap: A list of nodes where each node has 'label' and 'children' (array of strings) to represent key concepts.
      2. quiz: An array of 5 multiple choice questions with 'question', 'options' (array of 4 strings), and 'correctAnswer' (index 0-3).
      3. flashcards: An array of 5 items with 'term' and 'definition'.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mindMap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  children: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.INTEGER }
                }
              }
            },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating study materials:", error);
    return null;
  }
};

export const generateAudioOverview = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: `Provide a clear, engaging audio summary of this text, suitable for a podcast overview: "${text.substring(0, 5000)}"`,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } }
        }
      }
    });
    
    // Extract base64 audio
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("Error generating audio:", error);
    return null;
  }
};

export const chatWithNotebook = async (context: string, query: string, history: any[]) => {
  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `You are an intelligent tutor. Answer questions based on the provided context. Context: ${context.substring(0, 20000)}`,
      },
      history: history
    });
    const result = await chat.sendMessage({ message: query });
    return result.text;
  } catch (error) {
    return "Error connecting to tutor.";
  }
};

// --- GENERAL AI FEATURES ---

export const generalAiChat = async (message: string, history: any[]) => {
    try {
        const chat = ai.chats.create({
            model: "gemini-3-pro-preview", // Using Pro for complex reasoning
            config: {
                systemInstruction: "You are a helpful AI assistant in the GigGuard app.",
            },
            history: history
        });
        const result = await chat.sendMessage({ message });
        return result.text;
    } catch (e) {
        console.error(e);
        return "Sorry, I encountered an error.";
    }
}

export const generateProImage = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
        }
      },
    });
    
    // Check parts for image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    return null;
  } catch (error) {
    console.error("Image gen error:", error);
    return null;
  }
}